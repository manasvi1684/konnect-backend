// routes/authRoutes.js
import express from 'express';
import { signup, signin, signout } from '../controllers/authController.js';

const router = express.Router();

router.post('/signup', signup);
router.post('/signin', signin);
router.post('/signout', signout);

export default router;