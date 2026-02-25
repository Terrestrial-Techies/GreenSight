const { registerUser, loginUser } = require("../services/authService");

// Password validation function
const validatePassword = (password) => {
  // Minimum 12 characters, at least 1 uppercase, 1 lowercase, 1 number, 1 special char
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{12,}$/;
  return regex.test(password);
};

const register = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    // Password strength check
    if (!validatePassword(password)) {
      return res.status(400).json({ 
        error: "Password must be at least 12 characters and include uppercase, lowercase, number, and special character" 
      });
    }

    const user = await registerUser(email, password);

    res.status(201).json({
      message: "User registered successfully",
      user,
    });
  } catch (error) {
    console.error("Auth register error:", error);
    // Generic error message for users
    res.status(400).json({ error: "Registration failed. Please try again." });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const session = await loginUser(email, password);

    res.json({
      message: "Login successful",
      session,
    });
  } catch (error) {
    console.error("Auth login error:", error);
    // Generic error message for users
    res.status(400).json({ error: "Invalid email or password" });
  }
};

module.exports = { register, login };