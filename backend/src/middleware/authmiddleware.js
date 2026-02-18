const jwt = require("jsonwebtoken");
const jwksClient = require("jwks-rsa");

const client = jwksClient({
  jwksUri: `${process.env.SUPABASE_URL}/auth/v1/keys`
});

function getKey(header, callback) {
  client.getSigningKey(header.kid, function (err, key) {
    const signingKey = key.getPublicKey();
    callback(null, signingKey);
  });
}

const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) return res.status(401).json({ message: "No token provided" });

  jwt.verify(token, getKey, {}, (err, decoded) => {
    if (err) return res.status(403).json({ message: "Invalid token" });

    req.user = decoded;
    next();
  });
};

module.exports = verifyToken;
