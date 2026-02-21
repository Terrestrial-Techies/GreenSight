const { listPosts, createPost } = require('../services/communityService');

const getPosts = async (req, res) => {
  try {
    const items = await listPosts();
    res.json({ posts: items });
  } catch (err) {
    console.error('Get community posts error:', err);
    res.status(500).json({ error: 'Failed to load posts' });
  }
};

const postNew = async (req, res) => {
  try {
    const { author, title, body } = req.body;
    if (!author || !title || !body) return res.status(400).json({ error: 'author, title and body required' });
    const created = await createPost({ author, title, body });
    res.status(201).json({ post: created });
  } catch (err) {
    console.error('Create post error:', err);
    res.status(500).json({ error: 'Failed to create post' });
  }
};

module.exports = { getPosts, postNew };
