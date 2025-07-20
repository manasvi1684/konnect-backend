// models/profileModel.js
import db from '../db/db.js';

/**
 * Creates a mentor profile entry.
 * @param {number} userId - The ID of the user.
 * @param {string} specialization - The mentor's specialization.
 * @param {import("knex").Knex.Transaction} [trx] - Optional Knex transaction object.
 * @returns {Promise<void>}
 */
export const createMentorProfile = async (userId, specialization, trx) => {
  try {
    const query = trx || db;
    const existingProfile = await query('mentors').where({ user_id: userId }).first();
    if (!existingProfile) {
      await query('mentors').insert({ user_id: userId, specialization });
    } else {
      console.warn(`Mentor profile for user ${userId} already exists. Skipping creation.`);
      // In a real app, you might consider an 'update' here or throw an error if it's strictly a 'create'
    }
  } catch (error) {
    console.error(`Error creating mentor profile for user ${userId}:`, error);
    throw error;
  }
};

/**
 * Creates a student profile entry.
 * @param {number} userId - The ID of the user.
 * @param {string} major - The student's major.
 * @param {import("knex").Knex.Transaction} [trx] - Optional Knex transaction object.
 * @returns {Promise<void>}
 */
export const createStudentProfile = async (userId, major, trx) => {
  try {
    const query = trx || db;
    const existingProfile = await query('students').where({ user_id: userId }).first();
    if (!existingProfile) {
      await query('students').insert({ user_id: userId, major });
    } else {
      console.warn(`Student profile for user ${userId} already exists. Skipping creation.`);
    }
  } catch (error) {
    console.error(`Error creating student profile for user ${userId}:`, error);
    throw error;
  }
};

/**
 * Creates a mentee profile entry.
 * @param {number} userId - The ID of the user.
 * @param {string} interests - The mentee's interests.
 * @param {import("knex").Knex.Transaction} [trx] - Optional Knex transaction object.
 * @returns {Promise<void>}
 */
export const createMenteeProfile = async (userId, interests, trx) => {
  try {
    const query = trx || db;
    const existingProfile = await query('mentees').where({ user_id: userId }).first();
    if (!existingProfile) {
      await query('mentees').insert({ user_id: userId, interests });
    } else {
      console.warn(`Mentee profile for user ${userId} already exists. Skipping creation.`);
    }
  } catch (error) {
    console.error(`Error creating mentee profile for user ${userId}:`, error);
    throw error;
  }
};