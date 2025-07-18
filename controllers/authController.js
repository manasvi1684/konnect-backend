// controllers/authController.js
import { createUser, getUserByEmail } from '../models/userModel.js';
import { hashPassword, comparePasswords, generateToken } from '../services/authService.js';
// Corrected import names for clarity and consistency
import { getRoleIdByName, createUserRole, getUserRoles } from '../models/roleModel.js';
import db from '../db/db.js'; // Import the db instance for transactions

export const signup = async (req, res) => {
  try {
    const { name, email, password, roles } = req.body; // roles should be an array of strings, e.g., ['mentor', 'student']

    // Input validation (basic example)
    if (!name || !email || !password || !roles || !Array.isArray(roles) || roles.length === 0) {
      return res.status(400).json({ message: 'Missing required fields or invalid roles format.' });
    }

    // Check if user already exists
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Hash the password
    const hashedPassword = await hashPassword(password);

    let userId; // Declare userId outside the transaction scope
    let assignedRoles; // Declare assignedRoles outside the transaction scope

    // --- Transaction Start ---
    // This ensures that user creation and role assignments are atomic.
    // If any step fails, everything is rolled back.
    await db.transaction(async (trx) => {
      // Create the user in the users table within the transaction
      // FIX IS HERE: Correctly extracting the integer ID from the returned array of objects
      const [insertedUser] = await trx('users').insert({
        name,
        email,
        password: hashedPassword,
      }).returning('id'); // Knex returns an array of objects, e.g., [{ id: 4 }]
      userId = insertedUser.id; // Extract the 'id' property

      // Get Ids for each role being posted and create user_role entries
      const roleIds = [];
      for (const roleName of roles) {
        // Pass the transaction object (trx) to the model functions
        const roleId = await getRoleIdByName(roleName, trx);
        roleIds.push(roleId);
      }

      // Create the user_role entries within the transaction
      for (const roleId of roleIds) {
        // Pass the transaction object (trx) to the model functions
        await createUserRole(userId, roleId, trx);
      }

      // After successful creation and role assignment, fetch the assigned roles
      // to ensure the JWT reflects the current state accurately.
      assignedRoles = await getUserRoles(userId, trx); // Pass trx here too
    });
    // --- Transaction End (committed automatically if no error, rolled back if error) ---

    // Generate a JWT token with the newly assigned roles
    const token = generateToken({ id: userId, roles: assignedRoles });

    res.status(201).json({ message: 'User created successfully', token ,
       user: {
        id: userId, // The newly created user's ID
        name: name,
        email: email,
        roles: assignedRoles // The roles assigned to the user
      } 
    });
  } catch (error) {
    // Transaction will automatically rollback if an error occurs within its async callback
    console.error('Signup failed:', error);
    res.status(500).json({ message: 'Signup failed', error: error.message });
  }
};

export const signin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await getUserByEmail(email);
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Compare passwords
    const passwordMatch = await comparePasswords(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Get User Roles.
    // No transaction needed here as it's a read-only operation
    const userRoles = await getUserRoles(user.id);

    // Generate a JWT token
    const token = generateToken({ id: user.id, roles: userRoles });

    res.status(200).json({ message: 'Signin successful', token,
        user: {
        id: user.id, // Existing user's ID
        name: user.name, // Existing user's name
        email: user.email, // Existing user's email
        roles: userRoles // Roles fetched for the existing user
      }
     });
  } catch (error) {
    console.error('Signin failed:', error);
    res.status(500).json({ message: 'Signin failed', error: error.message });
  }
};

export const signout = (req, res) => {
  // For basic signout, this is fine.
  // For more complex session management, you might invalidate tokens on the server
  // (e.g., by blacklisting them or by having refresh tokens).
  res.status(200).json({ message: 'Signout successful' });
};