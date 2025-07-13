// controllers/authController.js
import { createUser, getUserByEmail } from '../models/userModel.js';
import { hashPassword, comparePasswords, generateToken } from '../services/authService.js';
import { createMentor, createMentee, createStudent } from '../models/roleModel.js';

export const signup = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Check if user already exists
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Hash the password
    const hashedPassword = await hashPassword(password);

    // Create the user in the users table
    const userId = await createUser({
      name,
      email,
      password: hashedPassword,
    });

    // Create the user in the role-specific table
    switch (role) {
      case 'mentor':
        await createMentor({ user_id: userId });
        break;
      case 'mentee':
        await createMentee({ user_id: userId });
        break;
      case 'student':
        await createStudent({ user_id: userId });
        break;
      default:
        console.warn(`Unknown role: ${role}`);
        return res.status(400).json({ message: 'Invalid role' }); // Return an error for invalid roles
    }

    // Generate a JWT token
    const token = generateToken({ id: userId, role });

    res.status(201).json({ message: 'User created successfully', token });
  } catch (error) {
    console.error(error);
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

    // Generate a JWT token
    const token = generateToken({ id: user.id, role: user.role });

    // Include user details in the response
    const userDetails = {
      id: user.id,
      name: user.name,
      email: user.email,
      // Add any other details you want to include
    };

    res.status(200).json({ message: 'Signin successful', token, user: userDetails });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Signin failed', error: error.message });
  }
};
  export const signout = (req, res) => {
    // Invalidate the token (client-side) or use refresh tokens (more complex)
    res.status(200).json({ message: 'Signout successful' });
  };