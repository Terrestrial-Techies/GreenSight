const supabase = require("../config/supabaseClient");

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY;
const IMAGE_CACHE_TTL = parseInt(process.env.IMAGE_CACHE_TTL_SECONDS || "86400", 10);

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
    if (!resp.ok) return [];
    const json = await resp.json();
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
  // Prefer nearbysearch with keyword = name
  try {
    if (latitude && longitude) {
      const loc = `${latitude},${longitude}`;
      const radius = 500; // meters
      const keyword = name ? `&keyword=${encodeURIComponent(name)}` : "";
      const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${loc}&radius=${radius}${keyword}&key=${GOOGLE_API_KEY}`;
      const resp = await fetch(url);
      if (!resp.ok) return null;
      const json = await resp.json();
      const first = (json.results && json.results[0]) || null;
      return first && first.place_id ? first.place_id : null;
    }
  } catch (e) {
    console.error("getPlaceIdFromLocation error:", e.message || e);
    return null;
  }
  return null;
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
  // If park has coordinates but no place_id, try to look it up
  if (!placeId && (park.latitude || park.lat) && (park.longitude || park.lng || park.lon)) {
    const latitude = park.latitude || park.lat;
    const longitude = park.longitude || park.lng || park.lon;
    try {
      const found = await getPlaceIdFromLocation({ latitude, longitude, name: park.name });
      if (found) placeId = found;
    } catch (e) {
      // ignore
    }
  }
  // also allow numeric coordinate fields without named keys
  if (!placeId && park.location && park.location.lat && park.location.lng) {
    try {
      const found = await getPlaceIdFromLocation({ latitude: park.location.lat, longitude: park.location.lng, name: park.name });
      if (found) placeId = found;
    } catch (e) {}
  }
  if (placeId) {
    try {
      const googlePhotos = await fetchGooglePlacePhotos(placeId, 5);
      if (googlePhotos.length) {
        // persist metadata (non-blocking best-effort)
        for (const p of googlePhotos) {
          try {
            await persistImageMetadata({
              park_id: parkId,
              url: p.url,
              source: p.source,
              provider_metadata: p.provider_metadata,
              caption: park.name || null,
              is_primary: false,
              width: p.width,
              height: p.height,
              attribution: p.attribution,
            });
          } catch (e) {
            // ignore individual persist errors
          }
        }
        setCache(cacheKey, googlePhotos);
        return googlePhotos;
      }
    } catch (e) {
      // continue to next fallback
    }
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
  const placeholder = [
    {
      url: process.env.DEFAULT_PARK_IMAGE || "https://example.com/default-park.jpg",
      source: "placeholder",
      provider_metadata: {},
      caption: park.name || "Park",
      is_primary: false,
      attribution: "",
    },
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
