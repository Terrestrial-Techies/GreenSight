const { registerUser, loginUser } = require("../services/authService");

/**
 * Helper to format the response consistently
 * This ensures the frontend always finds 'id' and 'token' in the same place.
 */
const formatAuthResponse = (session) => {
  // session might vary depending on if it's from registerUser or loginUser
  // Adjust these keys based on what your authService returns (e.g., Supabase vs JWT)
  const user = session.user || session; 
  const token = session.token || session.access_token || session.session?.access_token;

  return {
    token: token,
    user: {
      id: user.id || user.user_id,
      email: user.email,
    }
  };
};

const register = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" });
    } 

    const result = await registerUser(email, password);
    const authData = formatAuthResponse(result);

    res.status(201).json({
      message: "User registered successfully",
      ...authData
    });
  } catch (error) {
    console.error('Auth register error:', error);
    const message = error?.message || "Registration failed";
    if (/already registered/i.test(message) || /already exists/i.test(message)) {
      return res.status(409).json({ error: "Email is already registered. Please login instead." });
    }
    return res.status(400).json({ error: message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" });
    }

    const session = await loginUser(email, password);
    const authData = formatAuthResponse(session);

    res.json({
      message: "Login successful",
      ...authData
    });
  } catch (error) {
    console.error('Auth login error:', error);
    const message = error?.message || "Login failed";
    if (/invalid login credentials/i.test(message)) {
      return res.status(401).json({ error: "Invalid email or password." });
    }
    return res.status(400).json({ error: message });
  }
};

module.exports = { register, login };
