const supabase = require("../config/supabase");
const multer = require("multer");

const upload = multer({ storage: multer.memoryStorage() });

const normalizeReview = (row = {}) => ({
  ...row,
  review_text: row.review_text || row.text || row.content || row.message || "",
  created_at: row.created_at || row.createdAt || row.updated_at || new Date().toISOString(),
});

const hasMissingColumnError = (error) => {
  const msg = (error?.message || "").toLowerCase();
  return (
    error?.code === "42703" ||
    error?.code === "PGRST204" ||
    (msg.includes("column") && msg.includes("does not exist")) ||
    (msg.includes("could not find") && msg.includes("column"))
  );
};

// POST: Create community review (with optional image)
const createPost = async (req, res) => {
  try {
    const { park_id, user_id, review_text } = req.body;
    if (!park_id || !user_id || !review_text) {
      return res.status(400).json({ error: "park_id, user_id and review_text are required" });
    }

    let imageUrl = null;

    // If image uploaded
    if (req.file) {
      const fileName = `${Date.now()}-${req.file.originalname}`;

      const { error: uploadError } = await supabase.storage
        .from("review-images")
        .upload(fileName, req.file.buffer, {
          contentType: req.file.mimetype,
        });

      if (uploadError) {
        const msg = uploadError?.message || "Image upload failed";
        if (/row-level security policy/i.test(msg)) {
          return res.status(500).json({
            error: "Image upload blocked by Supabase RLS. Configure SUPABASE_SERVICE_ROLE_KEY on backend or add a storage INSERT policy for bucket 'review-images'.",
          });
        }
        return res.status(400).json({ error: `Image upload failed: ${msg}` });
      }

      const { data: publicUrl } = supabase.storage
        .from("review-images")
        .getPublicUrl(fileName);

      imageUrl = publicUrl.publicUrl;
    }

    const basePayload = { park_id, user_id };
    const imageFieldVariants = ["image_url", "image", "photo_url", "media_url"];
    const buildPayload = (textField, imageField = null) => {
      const payload = { ...basePayload, [textField]: review_text };
      if (imageUrl && imageField) {
        payload[imageField] = imageUrl;
      }
      return payload;
    };

    const textVariants = ["review_text", "text", "content", "message"];
    let insertResult = null;
    let lastError = null;

    for (const field of textVariants) {
      // Try insert with image field variants first (if image exists),
      // then fallback to text-only if image columns are unavailable.
      const payloadsToTry = imageUrl
        ? imageFieldVariants.map((imgField) => buildPayload(field, imgField)).concat(buildPayload(field))
        : [buildPayload(field)];

      let data = null;
      let error = null;

      for (const payload of payloadsToTry) {
        const result = await supabase.from("reviews").insert([payload]).select();
        data = result.data;
        error = result.error;

        if (!error) break;
        lastError = error;
        if (!hasMissingColumnError(error)) {
          throw error;
        }
      }

      if (!error) {
        insertResult = data?.[0] || null;
        break;
      }
    }

    if (!insertResult) {
      if (lastError && hasMissingColumnError(lastError)) {
        return res.status(500).json({
          error: "Reviews table schema mismatch. Expected one text column among: review_text, text, content, message.",
          details: lastError.message,
        });
      }
      throw lastError || new Error("Failed to create post");
    }

    res.status(201).json(normalizeReview(insertResult));

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err?.message || "Failed to create post" });
  }
};

// GET: Fetch all community posts
const getAllPosts = async (req, res) => {
  try {
    // Preferred query: include park name via relationship if FK is configured.
    const { data, error } = await supabase
      .from("reviews")
      .select(`
        *,
        parks(name)
      `)
      .order("created_at", { ascending: false });

    if (!error) {
      return res.json((data || []).map(normalizeReview));
    }

    // Fallback for projects where reviews->parks relationship is missing.
    const { data: reviewRows, error: reviewError } = await supabase
      .from("reviews")
      .select("*");

    if (reviewError) throw reviewError;

    const parkIds = [...new Set((reviewRows || []).map((r) => r.park_id).filter(Boolean))];
    let parkMap = {};

    if (parkIds.length) {
      const { data: parkRows } = await supabase
        .from("parks")
        .select("id, name")
        .in("id", parkIds);

      parkMap = (parkRows || []).reduce((acc, park) => {
        acc[park.id] = park.name;
        return acc;
      }, {});
    }

    const normalized = (reviewRows || [])
      .map((review) => normalizeReview(review))
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .map((review) => ({
      ...review,
      parks: { name: parkMap[review.park_id] || "Green Space" },
    }));

    res.json(normalized);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err?.message || "Failed to fetch posts" });
  }
};

module.exports = { createPost, getAllPosts, upload };

module.exports = { submitReview, getAllReviews, upload };

