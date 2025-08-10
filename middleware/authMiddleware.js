// middleware/authMiddleware.js
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET_KEY; // Ensure this matches your .env

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) {
    return res.status(401).json({ message: 'Authentication token required.' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      console.error("JWT verification failed:", err.message);
      return res.status(403).json({ message: 'Invalid or expired token.' });
    }
    req.user = user; // { id: userId, roles: ['mentor', 'student'] }
    next();
  });
};

/**
 * Middleware to authorize access based on user roles.
 * @param {string[]} allowedRoles - An array of roles allowed to access the route.
 * @returns {Function} Express middleware function.
 */
export const authorize = (allowedRoles) => {
  return (req, res, next) => {
    // Ensure req.user exists (i.e., authenticateToken ran before this)
    if (!req.user || !req.user.roles) {
      return res.status(401).json({ message: 'User not authenticated or roles missing.' });
    }

    const userRoles = req.user.roles; // e.g., ['mentor', 'student']

    // Check if the user has at least one of the allowed roles
    const hasPermission = userRoles.some(role => allowedRoles.includes(role));

    if (hasPermission) {
      next(); // User has permission, proceed
    } else {
      res.status(403).json({ message: 'Forbidden: You do not have the required role to perform this action.' });
    }
  };
};