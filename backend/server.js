import dotenv from 'dotenv';
// Load environment variables FIRST before importing files that might use process.env
dotenv.config();

import app from './src/app.js';
import connectDB from './src/config/connectDB.js';

const PORT = process.env.PORT || 3000;

// Connect to MongoDB first, then start the server
connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to connect to Database:', err);
    process.exit(1);
  });