// middleware/authMiddleware.js
import jwt from 'jsonwebtoken';

// Make sure your JWT_SECRET is loaded from .env
// You might need to import dotenv or ensure it's loaded globally in your index.js
// For example, if you use dotenv: import 'dotenv/config'; // At the very top of index.js
const JWT_SECRET = process.env.JWT_SECRET_KEY; // This must match the key you use in .env

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  // Expected format: "Bearer TOKEN"
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) {
    // No token provided
    return res.status(401).json({ message: 'Authentication token required.' });
  }

  // Verify the token
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      // Token is invalid or expired
      console.error("JWT verification failed:", err.message); // Log the specific JWT error
      return res.status(403).json({ message: 'Invalid or expired token.' });
    }
    // Token is valid, attach user payload (from JWT) to the request object
    // This 'user' object contains { id: userId, roles: assignedRoles }
    req.user = user;
    next(); // Proceed to the next middleware/route handler
  });
};