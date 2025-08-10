// controllers/marketplaceController.js
import { createSession, getSessions, getSessionById, updateSession, deleteSession } from '../models/sessionModel.js';
import { createBooking, getUserBookings, updateBookingStatus, deleteBooking, getBookingById } from '../models/bookingModel.js';
import db from '../db/db.js'; // For transactions if needed across models

// --- Session Management (Mentor facing) ---

export const createSessionController = async (req, res) => {
  try {
    const { title, description, sap_module, start_time, end_time, price, duration_minutes } = req.body;
    const mentor_id = req.user.id; // Mentor ID from authenticated user

    // Basic validation
    if (!title || !sap_module || !start_time || !end_time || price === undefined) {
      return res.status(400).json({ message: 'Missing required session fields.' });
    }

    // Convert timestamps to Date objects if necessary, or ensure they are ISO strings
    const sessionData = {
      mentor_id,
      title,
      description,
      sap_module,
      start_time: new Date(start_time),
      end_time: new Date(end_time),
      price,
      duration_minutes: duration_minutes || null // Optional field
    };

    const newSessionId = await createSession(sessionData); // Await the creation. newSessionId will be {id: 1} or just 1

    // --- MODIFICATION HERE ---
    // Ensure sessionId is extracted as a number before sending in response
    const extractedId = typeof newSessionId === 'object' && newSessionId !== null && 'id' in newSessionId
                          ? newSessionId.id
                          : newSessionId; // Use .id if it's an object, otherwise use it directly

    res.status(201).json({ message: 'Session created successfully', sessionId: extractedId });
    // --- END MODIFICATION ---

  } catch (error) {
    console.error('Error creating session:', error);
    res.status(500).json({ message: 'Failed to create session.', error: error.message });
  }
};

export const updateSessionController = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const updates = req.body;
    const mentor_id = req.user.id; // Authenticated user's ID

    // Ensure the mentor trying to update actually owns the session
    const session = await getSessionById(sessionId);
    if (!session || session.mentor_id !== mentor_id) {
      return res.status(403).json({ message: 'Forbidden: You do not own this session or session not found.' });
    }

    const updatedRows = await updateSession(sessionId, updates);
    if (updatedRows === 0) {
      return res.status(404).json({ message: 'Session not found or no changes applied.' });
    }
    res.status(200).json({ message: 'Session updated successfully' });
  } catch (error) {
    console.error('Error updating session:', error);
    res.status(500).json({ message: 'Failed to update session.', error: error.message });
  }
};

export const deleteSessionController = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const mentor_id = req.user.id; // Authenticated user's ID

    // Ensure the mentor trying to delete actually owns the session
    const session = await getSessionById(sessionId);
    if (!session || session.mentor_id !== mentor_id) {
      return res.status(403).json({ message: 'Forbidden: You do not own this session or session not found.' });
    }

    const deletedRows = await deleteSession(sessionId);
    if (deletedRows === 0) {
      return res.status(404).json({ message: 'Session not found.' });
    }
    res.status(200).json({ message: 'Session deleted successfully' });
  } catch (error) {
    console.error('Error deleting session:', error);
    res.status(500).json({ message: 'Failed to delete session.', error: error.message });
  }
};

// --- Session Viewing (Public/Student facing) ---

export const getSessionsController = async (req, res) => {
  try {
    const filters = req.query; // Allow filtering by query parameters (e.g., ?sap_module=FICO)
    const sessions = await getSessions(filters);
    res.status(200).json({ sessions });
  } catch (error) {
    console.error('Error getting all sessions:', error);
    res.status(500).json({ message: 'Failed to retrieve sessions.', error: error.message });
  }
};

export const getSessionByIdController = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = await getSessionById(sessionId);
    if (!session) {
      return res.status(404).json({ message: 'Session not found.' });
    }
    res.status(200).json({ session });
  } catch (error) {
    console.error('Error getting session by ID:', error);
    res.status(500).json({ message: 'Failed to retrieve session.', error: error.message });
  }
};

// --- Booking Management (Student facing) ---

export const bookSessionController = async (req, res) => {
  try {
    const { sessionId } = req.body;
    const student_id = req.user.id; // Student ID from authenticated user

    if (!sessionId) {
      return res.status(400).json({ message: 'Session ID is required to book.' });
    }

    // Optional: Check if session is still available (not fully booked if group, not in past)
    const session = await getSessionById(sessionId);
    if (!session) {
      return res.status(404).json({ message: 'Session not found.' });
    }
    if (new Date(session.end_time) < new Date()) {
        return res.status(400).json({ message: 'Cannot book a session that has already ended.' });
    }
    // Add logic here to prevent booking your own session if user is also a mentor:
    if (session.mentor_id === student_id) {
      return res.status(400).json({ message: 'You cannot book your own mentorship session.' });
    }


    const bookingId = await createBooking({ session_id: sessionId, student_id });
    res.status(201).json({ message: 'Session booked successfully', bookingId });
  } catch (error) {
    console.error('Error booking session:', error);
    if (error.message.includes('already been booked')) { // From bookingModel.js
      return res.status(409).json({ message: error.message });
    }
    res.status(500).json({ message: 'Failed to book session.', error: error.message });
  }
};

export const getUserBookingsController = async (req, res) => {
  try {
    const userId = req.user.id; // User ID from authenticated user
    const { role } = req.query; // Optional: filter by role (student or mentor)

    const bookings = await getUserBookings(userId, role);
    res.status(200).json({ bookings });
  } catch (error) {
    console.error('Error getting user bookings:', error);
    res.status(500).json({ message: 'Failed to retrieve bookings.', error: error.message });
  }
};

export const updateBookingStatusController = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { status } = req.body; // New status: 'confirmed', 'cancelled', 'completed'
    const userId = req.user.id; // Authenticated user's ID

    if (!['pending', 'confirmed', 'cancelled', 'completed'].includes(status)) {
      return res.status(400).json({ message: 'Invalid booking status provided.' });
    }

    const booking = await getBookingById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found.' });
    }

    // Authorization check: Only mentor who owns the session or the student who booked can change status (or admin)
    // For simplicity, let's say only the mentor can confirm/cancel. Student can only cancel their own.
    // Here, we'll implement mentor confirmation/cancellation
    if (booking.mentor_id !== userId) { // If the user is not the mentor for this session
        // If the user is the student who booked, they can cancel
        if (booking.student_id === userId && status === 'cancelled') {
             // Allow student to cancel their own booking
        } else {
             return res.status(403).json({ message: 'Forbidden: You do not have permission to update this booking status.' });
        }
    }

    const updatedRows = await updateBookingStatus(bookingId, status);
    if (updatedRows === 0) {
      return res.status(404).json({ message: 'Booking not found or status already set.' });
    }
    res.status(200).json({ message: 'Booking status updated successfully' });
  } catch (error) {
    console.error('Error updating booking status:', error);
    res.status(500).json({ message: 'Failed to update booking status.', error: error.message });
  }
};