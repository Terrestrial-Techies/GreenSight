const https = require("https");
const supabase = require("../config/supabaseClient");

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY;
const IMAGE_CACHE_TTL = parseInt(process.env.IMAGE_CACHE_TTL_SECONDS || "86400", 10);

// Minimal fetch wrapper using https module
function fetch(url, options = {}) {
  return new Promise((resolve, reject) => {
    const isPost = options.method === 'POST';
    const reqOptions = {
      method: options.method || 'GET',
      headers: {
        'User-Agent': 'GreenSight/1.0 (contact: admin@greensight.com)',
        ...(options.headers || {})
      }
    };
    const req = https.request(url, reqOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        let json = {};
        try {
            json = data ? JSON.parse(data) : {};
        } catch (e) {}
        resolve({
          ok: res.statusCode >= 200 && res.statusCode < 300,
          status: res.statusCode,
          json: () => Promise.resolve(json)
        });
      });
    });
    req.on('error', reject);
    if (isPost && options.body) {
      req.write(options.body);
    }
    req.end();
  });
}

const UNIFIED_FALLBACKS = [
  'https://images.unsplash.com/photo-1519331379826-f10be5486c6f', // Forest rays
  'https://images.unsplash.com/photo-1501785888041-af3ef285b470', // Lake mountain
  'https://images.unsplash.com/photo-1441974231531-c6227db76b6e', // Green forest
  'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05', // Foggy hills
  'https://images.unsplash.com/photo-1500627764677-200922858509', // Green fields
  'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d', // Sunny path
];

function getVibrantFallback(id) {
  // Use parkId to pick a consistent but different image for each park
  const idStr = String(id);
  const sum = idStr.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const index = Math.abs(sum) % UNIFIED_FALLBACKS.length;
  return `${UNIFIED_FALLBACKS[index]}?auto=format&fit=crop&q=80&w=1200`;
}

// Simple in-memory cache. For production use Redis.
const cache = new Map();

function setCache(key, value, ttl = IMAGE_CACHE_TTL) {
  const expires = Date.now() + ttl * 1000;
  cache.set(key, { value, expires });
}

function getCache(key) {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expires) {
    cache.delete(key);
    return null;
  }
  return entry.value;
}

async function getDbImages(parkId) {
  const { data, error } = await supabase
    .from("images")
    .select("*")
    .eq("park_id", parkId)
    .order("is_primary", { ascending: false });

  if (error) {
    throw error;
  }
  return data || [];
}

async function persistImageMetadata(metadata) {
  // metadata should contain park_id, url, source, provider_metadata, caption, is_primary, attribution
  const { data, error } = await supabase.from("images").insert([metadata]).select();
  if (error) throw error;
  return data && data[0];
}

async function fetchGooglePlacePhotos(placeId, maxResults = 3) {
  if (!GOOGLE_API_KEY || !placeId) return [];

  try {
// Optional Redis client for production caching
    const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${encodeURIComponent(
      placeId
    )}&fields=photos&key=${GOOGLE_API_KEY}`;

    const resp = await fetch(detailsUrl);
    const json = await resp.json();
    
    if (!resp.ok) {
      if (json.error_message) {
        console.warn(`[ImageService] Google Places Details error: ${json.error_message}`);
      }
      return [];
    }
    
    const photos = (json.result && json.result.photos) || [];

    const results = photos.slice(0, maxResults).map((p) => {
      const photoRef = p.photo_reference;
      const url = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=1600&photoreference=${photoRef}&key=${GOOGLE_API_KEY}`;
      return {
        url,
        width: p.width,
        height: p.height,
        source: "google_places",
        provider_metadata: { photo_reference: photoRef },
        attribution: "Google Places",
      };
    });

    return results;
  } catch (e) {
    console.error("fetchGooglePlacePhotos error:", e.message || e);
    return [];
  }
}

async function getPlaceIdFromLocation({ latitude, longitude, name } = {}) {
  if (!GOOGLE_API_KEY) return null;
  
  try {
    // Strategy 1: Text search (usually more accurate for specific park names)
    // We append 'park' to ensure we find the green space and not a nearby business
    const searchQuery = `${name}${name.toLowerCase().includes('park') ? '' : ' park'}`;
    const textSearchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(searchQuery)}&location=${latitude},${longitude}&radius=5000&key=${GOOGLE_API_KEY}`;
    
    console.log(`[ImageService] Trying Text Search for: ${searchQuery} near ${latitude},${longitude}`);
    const tsResp = await fetch(textSearchUrl);
    const tsJson = await tsResp.json();
    
    if (tsResp.ok) {
      if (tsJson.results && tsJson.results.length > 0) {
        console.log(`[ImageService] Text Search found: ${tsJson.results[0].name} (Place ID: ${tsJson.results[0].place_id})`);
        return tsJson.results[0].place_id;
      } else if (tsJson.status === 'REQUEST_DENIED') {
        console.warn(`[ImageService] Google API Key Denied: ${tsJson.error_message || 'Check if Places API is enabled'}`);
      }
    }

    // Strategy 2: Nearby search (fallback)
    if (latitude && longitude) {
      const loc = `${latitude},${longitude}`;
      const radius = 2000; // Increased radius to catch parks that might have centroids slightly offset
      const keyword = name ? `&keyword=${encodeURIComponent(name)}` : "";
      const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${loc}&radius=${radius}${keyword}&key=${GOOGLE_API_KEY}`;
      
      const resp = await fetch(url);
      if (!resp.ok) return null;
      const json = await resp.json();
      const first = (json.results && json.results[0]) || null;
      if (first) {
        console.log(`[ImageService] Nearby Search found: ${first.name} (Place ID: ${first.place_id})`);
        return first.place_id;
      }
    }
  } catch (e) {
    console.error("getPlaceIdFromLocation error:", e.message || e);
    return null;
  }
  return null;
}

async function fetchWikimediaImage(name) {
  try {
    const query = `${name}${name.toLowerCase().includes('nigeria') ? '' : ' Nigeria'}`;
    const url = `https://en.wikipedia.org/w/api.php?action=query&format=json&prop=pageimages&pithumbsize=1200&generator=search&gsrsearch=${encodeURIComponent(query)}&gsrlimit=1`;
    
    const resp = await fetch(url);
    const json = await resp.json();
    
    if (json.query && json.query.pages) {
      const page = Object.values(json.query.pages)[0];
      if (page.thumbnail) {
        return [{
          url: page.thumbnail.source,
          width: page.thumbnail.width,
          height: page.thumbnail.height,
          source: "wikimedia",
          provider_metadata: { pageid: page.pageid, title: page.title },
          attribution: `Wikimedia Commons: ${page.title}`,
          is_primary: true
        }];
      }
    }
  } catch (e) {
    console.error(`[ImageService] Wikimedia failed for ${name}:`, e.message);
  }
  return [];
}
async function searchUnsplash(query, perPage = 5) {
  if (!UNSPLASH_ACCESS_KEY || !query) return [];
  const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=${perPage}`;
  const resp = await fetch(url, { headers: { Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}` } });
  if (!resp.ok) return [];
  const json = await resp.json();
  const results = (json.results || []).map((r) => ({
    url: r.urls && (r.urls.raw || r.urls.full || r.urls.regular),
    width: r.width,
    height: r.height,
    source: "unsplash_ai",
    provider_metadata: { unsplash_id: r.id, user: r.user && r.user.username },
    attribution: r.user && `${r.user.name} on Unsplash`,
  }));
  return results;
}

function generatePromptLocally(park) {
  // Lightweight prompt generator if Gemini isn't configured.
  const parts = [];
  if (park.name) parts.push(park.name);
  if (park.description) parts.push(park.description);
  if (park.features && park.features.length) parts.push(park.features.join(", "));
  if (park.vibe) parts.push(park.vibe);
  const base = parts.join(" - ") || park.name || "park";
  return `${base} scenic photo, natural lighting, high resolution`;
}

async function getImagesForPark(parkId, park = {}) {
  const cacheKey = `park_images:${parkId}`;
  const cached = getCache(cacheKey);
  if (cached) return cached;

  // 1. Primary DB image
  const dbImages = await getDbImages(parkId);
  if (dbImages && dbImages.length) {
    setCache(cacheKey, dbImages);
    return dbImages;
  }

  // 2. Google Places
  let placeId = park.place_id || park.google_place_id;
  const lat = park.latitude || park.lat || park.lat;
  const lng = park.longitude || park.lng || park.lon;

  if (!placeId && lat && lng) {
    try {
      const found = await getPlaceIdFromLocation({ latitude: lat, longitude: lng, name: park.name });
      if (found) placeId = found;
    } catch (e) {}
  }

  if (placeId) {
    try {
      const googlePhotos = await fetchGooglePlacePhotos(placeId, 5);
      if (googlePhotos.length) {
        // Try to persist to DB if table exists (ignore if not)
        try {
          // Fallback logic: Update parks table directly if images table fails
          const primaryUrl = googlePhotos[0].url;
          await supabase.from("parks").update({ image_url: primaryUrl }).eq("id", parkId);
          
          for (const p of googlePhotos) {
            await persistImageMetadata({
              park_id: parkId,
              url: p.url,
              source: p.source,
              provider_metadata: p.provider_metadata,
              caption: park.name || null,
              is_primary: p === googlePhotos[0], // mark first as primary
              width: p.width,
              height: p.height,
              attribution: p.attribution,
            });
          }
        } catch (e) {
          // ignore table errors
        }
        setCache(cacheKey, googlePhotos);
        return googlePhotos;
      }
    } catch (e) {
      console.error(`[ImageService] Google Photos failed: ${e.message}`);
    }
  }

  // 3. Wikimedia Fallback (Free, Legit, No key required)
  console.log(`[ImageService] Trying Wikimedia for ${park.name}`);
  const wikiPhotos = await fetchWikimediaImage(park.name);
  if (wikiPhotos.length) {
    try {
      await supabase.from("parks").update({ image_url: wikiPhotos[0].url }).eq("id", parkId);
      await persistImageMetadata({
        park_id: parkId,
        url: wikiPhotos[0].url,
        source: wikiPhotos[0].source,
        provider_metadata: wikiPhotos[0].provider_metadata,
        caption: park.name,
        is_primary: true,
        attribution: wikiPhotos[0].attribution,
      }).catch(()=>{});
    } catch (e) {}
    setCache(cacheKey, wikiPhotos);
    return wikiPhotos;
  }

  // 3. Gemini+Unsplash: generate prompt then search Unsplash
  const prompt = generatePromptLocally(park);
  try {
    const unsplashResults = await searchUnsplash(prompt, 6);
    if (unsplashResults.length) {
      for (const u of unsplashResults) {
        try {
          await persistImageMetadata({
            park_id: parkId,
            url: u.url,
            source: u.source,
            provider_metadata: u.provider_metadata,
            caption: park.name || null,
            is_primary: false,
            width: u.width,
            height: u.height,
            attribution: u.attribution,
          });
        } catch (e) {
          // ignore
        }
      }
      setCache(cacheKey, unsplashResults);
      return unsplashResults;
    }
  } catch (e) {
    // ignore and fallthrough
  }

  // 4. Fallback placeholder
  const fallbackUrl = getVibrantFallback(parkId);
  const placeholder = [
    {
      url: process.env.DEFAULT_PARK_IMAGE || fallbackUrl,
      source: "placeholder",
      is_primary: true,
      caption: park.name || "Green Space"
    }
  ];
  setCache(cacheKey, placeholder);
  return placeholder;
}

async function refreshImagesForPark(parkId, park = {}) {
  // Clear cache and re-run discovery
  const cacheKey = `park_images:${parkId}`;
  cache.delete(cacheKey);
  return getImagesForPark(parkId, park);
}

module.exports = {
  getImagesForPark,
  refreshImagesForPark,
  // exported for testing
  fetchGooglePlacePhotos,
  searchUnsplash,
  persistImageMetadata,
}
