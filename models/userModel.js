// models/userModel.js
import db from '../db/db.js';

export const createUser = async (userData) => {
  try {
    const result = await db('users').insert(userData).returning('id');
    const id = result[0].id;
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