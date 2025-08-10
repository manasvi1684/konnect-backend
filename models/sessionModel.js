// models/sessionModel.js
import db from '../db/db.js';

/**
 * Creates a new mentorship session.
 * @param {Object} sessionData - Data for the new session.
 * @param {number} sessionData.mentor_id - The ID of the mentor offering the session.
 * @param {string} sessionData.title - Title of the session.
 * @param {string} sessionData.description - Description of the session.
 * @param {string} sessionData.sap_module - The SAP module covered.
 * @param {string} sessionData.start_time - ISO timestamp for session start.
 * @param {string} sessionData.end_time - ISO timestamp for session end.
 * @param {number} sessionData.price - Price of the session.
 * @param {number} [sessionData.duration_minutes] - Duration in minutes.
 * @param {import("knex").Knex.Transaction} [trx] - Optional Knex transaction object.
 * @returns {Promise<number>} The ID of the newly created session.
 */
export const createSession = async (sessionData, trx) => {
  try {
    const query = trx || db;
    const [id] = await query('sessions').insert(sessionData).returning('id');
    return id;
  } catch (error) {
    console.error('Error creating session:', error);
    throw error;
  }
};

/**
 * Retrieves all available sessions, optionally filtered.
 * @param {Object} [filters] - Optional filters (e.g., { sap_module: 'FICO', mentor_id: 1 }).
 * @param {import("knex").Knex.Transaction} [trx] - Optional Knex transaction object.
 * @returns {Promise<Array<Object>>} An array of session objects.
 */
export const getSessions = async (filters = {}, trx) => {
  try {
    const query = trx || db;
    // Start with a join to get mentor's name
    let sessionsQuery = query('sessions')
      .join('users as mentors', 'sessions.mentor_id', '=', 'mentors.id')
      .select(
        'sessions.*',
        'mentors.name as mentor_name',
        'mentors.email as mentor_email'
      );

    // Apply filters
    if (filters.sap_module) {
      sessionsQuery = sessionsQuery.where('sessions.sap_module', filters.sap_module);
    }
    if (filters.mentor_id) {
      sessionsQuery = sessionsQuery.where('sessions.mentor_id', filters.mentor_id);
    }
    // Add more filters as needed (e.g., date range, price range)

    // Order by start_time ascending by default
    sessionsQuery = sessionsQuery.orderBy('sessions.start_time', 'asc');

    const sessions = await sessionsQuery;
    return sessions;
  } catch (error) {
    console.error('Error getting sessions:', error);
    throw error;
  }
};

/**
 * Retrieves a single session by its ID.
 * @param {number} sessionId - The ID of the session.
 * @param {import("knex").Knex.Transaction} [trx] - Optional Knex transaction object.
 * @returns {Promise<Object|null>} The session object or null if not found.
 */
export const getSessionById = async (sessionId, trx) => {
  try {
    const query = trx || db;
    const session = await query('sessions')
      .join('users as mentors', 'sessions.mentor_id', '=', 'mentors.id')
      .select(
        'sessions.*',
        'mentors.name as mentor_name',
        'mentors.email as mentor_email'
      )
      .where('sessions.id', sessionId)
      .first();
    return session;
  } catch (error) {
    console.error(`Error getting session by ID ${sessionId}:`, error);
    throw error;
  }
};

/**
 * Updates an existing session.
 * @param {number} sessionId - The ID of the session to update.
 * @param {Object} updates - Object containing fields to update.
 * @param {import("knex").Knex.Transaction} [trx] - Optional Knex transaction object.
 * @returns {Promise<number>} Number of rows updated (1 if successful, 0 otherwise).
 */
export const updateSession = async (sessionId, updates, trx) => {
  try {
    const query = trx || db;
    const updatedRows = await query('sessions').where({ id: sessionId }).update(updates);
    return updatedRows;
  } catch (error) {
    console.error(`Error updating session ${sessionId}:`, error);
    throw error;
  }
};

/**
 * Deletes a session.
 * @param {number} sessionId - The ID of the session to delete.
 * @param {import("knex").Knex.Transaction} [trx] - Optional Knex transaction object.
 * @returns {Promise<number>} Number of rows deleted (1 if successful, 0 otherwise).
 */
export const deleteSession = async (sessionId, trx) => {
  try {
    const query = trx || db;
    const deletedRows = await query('sessions').where({ id: sessionId }).del();
    return deletedRows;
  } catch (error) {
    console.error(`Error deleting session ${sessionId}:`, error);
    throw error;
  }
};