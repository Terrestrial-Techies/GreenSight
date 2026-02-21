const posts = [];

const listPosts = async () => posts;

const createPost = async ({ author, title, body }) => {
  const id = posts.length + 1;
  const post = { id, author, title, body, createdAt: new Date().toISOString() };
  posts.unshift(post);
  return post;
};

module.exports = { listPosts, createPost };
