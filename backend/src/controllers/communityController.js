const supabase = require("../config/supabase");
const multer = require("multer");

const upload = multer({ storage: multer.memoryStorage() });

const normalizeReview = (row = {}) => ({
  ...row,
  review_text: row.review_text || "",
  created_at: row.created_at || row.createdAt || row.updated_at || new Date().toISOString(),
});

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
      const safeName = (req.file.originalname || "upload.jpg").replace(/\s+/g, "_");
      const fileName = `reviews/${Date.now()}-${safeName}`;

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

    const payload = {
      park_id,
      user_id,
      review_text,
      image_url: imageUrl,
    };

    const { data, error } = await supabase
      .from("reviews")
      .insert([payload])
      .select()
      .single();

    if (error) {
      const msg = error?.message || "";
      if (/Could not find the 'review_text' column/i.test(msg) || /Could not find the 'image_url' column/i.test(msg)) {
        return res.status(500).json({
          error: "Reviews table schema mismatch. Run backend/sql/supabase_reviews_setup.sql in Supabase SQL editor.",
          details: msg,
        });
      }
      throw error;
    }

    res.status(201).json(normalizeReview(data));

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
        id,
        park_id,
        user_id,
        review_text,
        image_url,
        created_at,
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

