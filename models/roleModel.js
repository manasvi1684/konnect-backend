// models/roleModel.js
import db from '../db/db.js';

/**
 * Fetches the ID of a role by its name. Assumes roles are pre-seeded.
 * If a role name doesn't exist, it will throw an error, which implies an invalid role request.
 * @param {string} roleName - The name of the role (e.g., 'mentor', 'student').
 * @param {import("knex").Knex.Transaction} [trx] - Optional Knex transaction object.
 * @returns {Promise<number>} The ID of the role.
 * @throws {Error} If the role is not found.
 */
export const getRoleIdByName = async (roleName, trx) => {
  try {
    const query = trx || db; // Use transaction if provided, else use global db
    const role = await query('roles').where({ name: roleName }).first();

    if (!role) {
      throw new Error(`Role '${roleName}' not found.`);
    }
    return role.id;
  } catch (error) {
    console.error(`Error getting role ID for "${roleName}":`, error);
    throw error;
  }
};

/**
 * Creates an entry in the user_roles junction table.
 * @param {number} userId - The ID of the user.
 * @param {number} roleId - The ID of the role.
 * @param {import("knex").Knex.Transaction} [trx] - Optional Knex transaction object.
 * @returns {Promise<void>}
 */
export const createUserRole = async (userId, roleId, trx) => {
  try {
    const query = trx || db; // Use transaction if provided, else use global db

    // Check if the user-role combination already exists to prevent duplicates
    // This is good practice for primary key violations, though 'primary(['user_id', 'role_id'])'
    // in migration would also prevent it at DB level.
    const existingEntry = await query('user_roles')
      .where({ user_id: userId, role_id: roleId })
      .first();

    if (!existingEntry) {
      await query('user_roles').insert({ user_id: userId, role_id: roleId });
    } else {
      // This case means the user already has the role, which is not an error
      // during signup, but good to log or handle gracefully.
      console.warn(`User ${userId} already has role ${roleId}. Skipping duplicate insert.`);
    }
  } catch (error) {
    console.error('Error creating user role relation:', error);
    throw error;
  }
};

/**
 * Retrieves all roles associated with a given user ID.
 * @param {number} userId - The ID of the user.
 * @param {import("knex").Knex.Transaction} [trx] - Optional Knex transaction object.
 * @returns {Promise<string[]>} An array of role names.
 */
export const getUserRoles = async (userId, trx) => {
  try {
    const query = trx || db; // Use transaction if provided, else use global db
    const roles = await query('user_roles')
      .join('roles', 'user_roles.role_id', '=', 'roles.id')
      .select('roles.name')
      .where('user_roles.user_id', userId);
    return roles.map((row) => row.name);
  } catch (error) {
    console.error('Error getting user roles:', error);
    throw error;
  }
};