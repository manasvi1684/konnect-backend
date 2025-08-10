// routes/marketplaceRoutes.js
import express from 'express';
import { authenticateToken, authorize } from '../middleware/authMiddleware.js'; // Import both middlewares
import {
  createSessionController,
  getSessionsController,
  getSessionByIdController,
  updateSessionController,
  deleteSessionController,
  bookSessionController,
  getUserBookingsController,
  updateBookingStatusController
} from '../controllers/marketplaceController.js';

const router = express.Router();

// --- Public/General Session Routes (Anyone can view sessions) ---
router.get('/sessions', getSessionsController); // GET /api/marketplace/sessions
router.get('/sessions/:sessionId', getSessionByIdController); // GET /api/marketplace/sessions/:sessionId

// --- Mentor-Specific Session Routes (Requires authentication and 'mentor' role) ---
router.post('/sessions', authenticateToken, authorize(['mentor']), createSessionController); // POST /api/marketplace/sessions
router.put('/sessions/:sessionId', authenticateToken, authorize(['mentor']), updateSessionController); // PUT /api/marketplace/sessions/:sessionId
router.delete('/sessions/:sessionId', authenticateToken, authorize(['mentor']), deleteSessionController); // DELETE /api/marketplace/sessions/:sessionId

// --- Booking Routes (Requires authentication) ---
router.post('/bookings', authenticateToken, authorize(['student']), bookSessionController); // POST /api/marketplace/bookings
router.get('/my-bookings', authenticateToken, getUserBookingsController); // GET /api/marketplace/my-bookings
router.put('/bookings/:bookingId/status', authenticateToken, updateBookingStatusController); // PUT /api/marketplace/bookings/:bookingId/status

export default router;