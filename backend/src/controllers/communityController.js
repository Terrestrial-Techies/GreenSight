const supabase = require("../config/supabase");
const multer = require("multer");

const upload = multer({ storage: multer.memoryStorage() });

const normalizeReview = (row = {}) => ({
  ...row,
  review_text: row.review_text || row.text || row.content || row.message || "",
  created_at: row.created_at || row.createdAt || row.updated_at || new Date().toISOString(),
});

// POST: Create community review (with optional image)
const submitReview = async (req, res) => {
  try {
    const { park_id, user_id, review_text } = req.body;

    let imageUrl = null;

    // If image uploaded
    if (req.file) {
      const fileName = `${Date.now()}-${req.file.originalname}`;

      const { error: uploadError } = await supabase.storage
        .from("review-images")
        .upload(fileName, req.file.buffer, {
          contentType: req.file.mimetype,
        });

      if (uploadError) throw uploadError;

      const { data: publicUrl } = supabase.storage
        .from("review-images")
        .getPublicUrl(fileName);

      imageUrl = publicUrl.publicUrl;
    }

    const { data, error } = await supabase
      .from("reviews")
      .insert([
        {
          park_id,
          user_id,
          review_text,
          image_url: imageUrl
        }
      ])
      .select();

    if (error) throw error;

    res.status(201).json(data[0]);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create post" });
  }
};

// GET: Fetch all community posts
const getAllReviews = async (req, res) => {
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

module.exports = { submitReview, getAllReviews, upload };
