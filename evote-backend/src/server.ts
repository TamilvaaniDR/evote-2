import dotenv from 'dotenv';
dotenv.config();

import app from './app';

// Get port from .env or fallback
const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log('====================================');
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log('====================================');
});
