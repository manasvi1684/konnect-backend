// models/bookingModel.js
import db from '../db/db.js';

/**
 * Creates a new booking for a session.
 * @param {Object} bookingData - Data for the new booking.
 * @param {number} bookingData.session_id - The ID of the session being booked.
 * @param {number} bookingData.student_id - The ID of the student making the booking.
 * @param {import("knex").Knex.Transaction} [trx] - Optional Knex transaction object.
 * @returns {Promise<number>} The ID of the newly created booking.
 */
export const createBooking = async (bookingData, trx) => {
  try {
    const query = trx || db;
    const [id] = await query('bookings').insert(bookingData).returning('id');
    return id;
  } catch (error) {
    // Check for unique constraint violation (student booking same session twice)
    if (error.code === '23505') { // PostgreSQL unique violation error code
        throw new Error('This session has already been booked by this student.');
    }
    console.error('Error creating booking:', error);
    throw error;
  }
};

/**
 * Retrieves bookings for a specific user (either as a student or for sessions they mentor).
 * @param {number} userId - The ID of the user.
 * @param {string} [roleFilter] - Optional: 'student' or 'mentor' to filter bookings.
 * @param {import("knex").Knex.Transaction} [trx] - Optional Knex transaction object.
 * @returns {Promise<Array<Object>>} An array of booking objects with session and user details.
 */
export const getUserBookings = async (userId, roleFilter = null, trx) => {
  try {
    const query = trx || db;
    let bookingsQuery = query('bookings')
      .join('sessions', 'bookings.session_id', '=', 'sessions.id')
      .join('users as students', 'bookings.student_id', '=', 'students.id')
      .join('users as mentors', 'sessions.mentor_id', '=', 'mentors.id') // Join to get mentor name

      .select(
        'bookings.*',
        'sessions.title as session_title',
        'sessions.description as session_description',
        'sessions.start_time',
        'sessions.end_time',
        'sessions.price',
        'mentors.id as mentor_id',
        'mentors.name as mentor_name',
        'mentors.email as mentor_email',
        'students.name as student_name',
        'students.email as student_email'
      );

    if (roleFilter === 'student') {
      bookingsQuery = bookingsQuery.where('bookings.student_id', userId);
    } else if (roleFilter === 'mentor') {
      bookingsQuery = bookingsQuery.where('sessions.mentor_id', userId);
    } else {
      // If no roleFilter, get all bookings where user is either student or mentor
      bookingsQuery = bookingsQuery.where(function() {
        this.where('bookings.student_id', userId).orWhere('sessions.mentor_id', userId);
      });
    }

    bookingsQuery = bookingsQuery.orderBy('sessions.start_time', 'desc');

    const bookings = await bookingsQuery;
    return bookings;
  } catch (error) {
    console.error(`Error getting bookings for user ${userId}:`, error);
    throw error;
  }
};

/**
 * Retrieves a single booking by its ID.
 * @param {number} bookingId - The ID of the booking.
 * @param {import("knex").Knex.Transaction} [trx] - Optional Knex transaction object.
 * @returns {Promise<Object|null>} The booking object or null if not found.
 */
export const getBookingById = async (bookingId, trx) => {
  try {
    const query = trx || db;
    const booking = await query('bookings')
      .join('sessions', 'bookings.session_id', '=', 'sessions.id')
      .join('users as students', 'bookings.student_id', '=', 'students.id')
      .join('users as mentors', 'sessions.mentor_id', '=', 'mentors.id') // Join to get mentor name
      .select(
        'bookings.*',
        'sessions.title as session_title',
        'sessions.description as session_description',
        'sessions.start_time',
        'sessions.end_time',
        'sessions.price',
        'mentors.id as mentor_id',
        'mentors.name as mentor_name',
        'mentors.email as mentor_email',
        'students.name as student_name',
        'students.email as student_email'
      )
      .where('bookings.id', bookingId)
      .first();
    return booking;
  } catch (error) {
    console.error(`Error getting booking by ID ${bookingId}:`, error);
    throw error;
  }
};

/**
 * Updates the status of a booking.
 * @param {number} bookingId - The ID of the booking to update.
 * @param {string} newStatus - The new status ('pending', 'confirmed', 'cancelled', 'completed').
 * @param {import("knex").Knex.Transaction} [trx] - Optional Knex transaction object.
 * @returns {Promise<number>} Number of rows updated (1 if successful, 0 otherwise).
 */
export const updateBookingStatus = async (bookingId, newStatus, trx) => {
  try {
    const query = trx || db;
    const updatedRows = await query('bookings').where({ id: bookingId }).update({ status: newStatus });
    return updatedRows;
  } catch (error) {
    console.error(`Error updating booking status for booking ${bookingId}:`, error);
    throw error;
  }
};

/**
 * Deletes a booking.
 * @param {number} bookingId - The ID of the booking to delete.
 * @param {import("knex").Knex.Transaction} [trx] - Optional Knex transaction object.
 * @returns {Promise<number>} Number of rows deleted (1 if successful, 0 otherwise).
 */
export const deleteBooking = async (bookingId, trx) => {
  try {
    const query = trx || db;
    const deletedRows = await query('bookings').where({ id: bookingId }).del();
    return deletedRows;
  } catch (error) {
    console.error(`Error deleting booking ${bookingId}:`, error);
    throw error;
  }
};