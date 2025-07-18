// models/userModel.js
import db from '../db/db.js';

export const createUser = async (userData) => {
  try {
    // This function is still used but primarily for direct calls outside of the main
    // signup flow or if you decide not to use a transaction for single user creation.
    // In authController's signup, we're now using `trx('users').insert(...)` directly.
    const [id] = await db('users').insert(userData).returning('id');
    return id;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};

export const getUserByEmail = async (email) => {
  try {
    const user = await db('users').where({ email }).first();
    return user;
  } catch (error) {
    console.error('Error getting user by email:', error);
    throw error;
  }
};