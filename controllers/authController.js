// controllers/authController.js
import { createUser, getUserByEmail, getFullUserProfile } from '../models/userModel.js'; // getFullUserProfile moved here
import { hashPassword, comparePasswords, generateToken } from '../services/authService.js';
// Corrected import names for clarity and consistency
import { createMentorProfile, createStudentProfile, createMenteeProfile } from '../models/profileModel.js'; // <-- CORRECT IMPORT
import { getRoleIdByName, createUserRole, getUserRoles } from '../models/roleModel.js';
import db from '../db/db.js'; // Import the db instance for transactions

export const signup = async (req, res) => {
  try {
    // MODIFIED: Destructure additional profile fields from req.body
    const { name, email, password, roles, specialization, major, interests } = req.body; // NOW ACCEPTING THESE

    // Input validation (basic example) - EXTEND THIS LATER FOR ROLE-SPECIFIC FIELDS
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
      const [insertedUser] = await trx('users').insert({
        name,
        email,
        password: hashedPassword,
      }).returning('id');
      userId = insertedUser.id; // Extract the 'id' property

      // Get Ids for each role being posted and create user_role entries
      const roleIds = [];
      for (const roleName of roles) {
        // Pass the transaction object (trx) to the model functions
        const roleId = await getRoleIdByName(roleName, trx);
        roleIds.push(roleId);

        // --- RE-INTRODUCED LOGIC: CONDITIONAL PROFILE CREATION ---
        if (roleName === 'mentor') {
          if (specialization) {
            await createMentorProfile(userId, specialization, trx);
          } else {
            console.warn(`Mentor role selected for user ${userId} but no specialization provided.`);
            // Optional: throw new Error("Specialization is required for mentor role."); if mandatory
          }
        } else if (roleName === 'student') {
          if (major) {
            await createStudentProfile(userId, major, trx);
          } else {
            console.warn(`Student role selected for user ${userId} but no major provided.`);
          }
        } else if (roleName === 'mentee') {
          if (interests) {
            await createMenteeProfile(userId, interests, trx);
          } else {
            console.warn(`Mentee role selected for user ${userId} but no interests provided.`);
          }
        }
        // --- END RE-INTRODUCED LOGIC ---
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

    // MODIFIED: Fetch full user profile for signin response
    const fullUser = await getFullUserProfile(user.id); // Using the new function
    if (!fullUser) {
      return res.status(500).json({ message: 'User data inconsistencies detected.' });
    }

    // Generate a JWT token
    const token = generateToken({ id: fullUser.id, roles: fullUser.roles }); // Use roles from fullUser

    res.status(200).json({ message: 'Signin successful', token,
        user: fullUser // Return the full user object including profiles
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