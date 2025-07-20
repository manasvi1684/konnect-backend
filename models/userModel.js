// models/userModel.js
import db from '../db/db.js';

export const createUser = async (userData) => {
  try {
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

/**
 * Retrieves comprehensive user data including roles and role-specific profiles.
 * @param {number} userId - The ID of the user.
 * @returns {Promise<Object|null>} A user object with roles and profile details, or null if not found.
 */
export const getFullUserProfile = async (userId) => {
  try {
    // 1. Fetch basic user details
    const user = await db('users').where({ id: userId }).first();
    if (!user) {
      return null; // User not found
    }

    // 2. Fetch user's roles
    const userRoles = await db('user_roles')
      .join('roles', 'user_roles.role_id', '=', 'roles.id')
      .select('roles.name')
      .where('user_roles.user_id', userId);

    user.roles = userRoles.map((row) => row.name);

    // 3. Conditionally fetch role-specific profiles
    // These queries are reads, so they don't need to be in a separate model for getFullUserProfile
    if (user.roles.includes('mentor')) {
      user.mentorProfile = await db('mentors').where({ user_id: userId }).first();
      if (user.mentorProfile) delete user.mentorProfile.user_id;
    }
    if (user.roles.includes('student')) {
      user.studentProfile = await db('students').where({ user_id: userId }).first();
      if (user.studentProfile) delete user.studentProfile.user_id;
    }
    if (user.roles.includes('mentee')) {
      user.menteeProfile = await db('mentees').where({ user_id: userId }).first();
      if (user.menteeProfile) delete user.menteeProfile.user_id;
    }

    // Remove password hash before returning
    delete user.password;

    return user;
  } catch (error) {
    console.error(`Error getting full user profile for user ${userId}:`, error);
    throw error;
  }
};