const supabase = require("../config/supabase");
const multer = require("multer");

const upload = multer({ storage: multer.memoryStorage() });

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
    const { data, error } = await supabase
      .from("reviews")
      .select(`
        id,
        review_text,
        image_url,
        created_at,
        parks(name)
      `)
      .order("created_at", { ascending: false });

    if (error) throw error;

    res.json(data);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch posts" });
  }
};

module.exports = { submitReview, getAllReviews, upload };