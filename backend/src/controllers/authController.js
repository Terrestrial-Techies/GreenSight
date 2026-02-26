const { registerUser, loginUser } = require("../services/authService");

const register = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" });
    } 

    const user = await registerUser(email, password);

    res.status(201).json({
      message: "User registered successfully",
      user,
    });
  } catch (error) {
    console.error('Auth register error:', error);
    res.status(400).json({ error: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" });
    }

    const session = await loginUser(email, password);

    res.json({
      message: "Login successful",
      session,
    });
  } catch (error) {
    console.error('Auth login error:', error);
    res.status(400).json({ error: error.message });
  }
};

module.exports = { register, login };