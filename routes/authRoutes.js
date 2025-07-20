// routes/authRoutes.js
import express from 'express';
import { signup, signin, signout } from '../controllers/authController.js';
import { getFullUserProfile } from '../models/userModel.js'; // Import getFullUserProfile
import { authenticateToken } from '../middleware/authMiddleware.js'; // NEW IMPORT for middleware

const router = express.Router();

router.post('/signup', signup);
router.post('/signin', signin);
router.post('/signout', signout);

// NEW ENDPOINT: Get authenticated user's own profile
// This route is protected by the authenticateToken middleware
router.get('/me', authenticateToken, async (req, res) => {
  try {
    // req.user.id is populated by the authenticateToken middleware after verifying the JWT
    const user = await getFullUserProfile(req.user.id);
    if (!user) {
      // This case should ideally not happen if a valid token pointed to a non-existent user
      return res.status(404).json({ message: 'User not found in database.' });
    }
    res.status(200).json({ user });
  } catch (error) {
    console.error('Error fetching user profile from /api/auth/me:', error);
    res.status(500).json({ message: 'Failed to retrieve profile.', error: error.message });
  }
});

export default router;