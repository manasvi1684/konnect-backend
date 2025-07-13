// index.js
import * as dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import authRoutes from './routes/authRoutes.js';

const app = express();
const port = process.env.PORT || 3001; //Use environment variables or port 3001

app.use(express.json()); // Middleware to parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Add to parse URL-encoded bodies

app.use('/auth', authRoutes);

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});