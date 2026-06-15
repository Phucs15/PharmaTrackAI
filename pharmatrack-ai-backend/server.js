import dotenv from 'dotenv';

dotenv.config();

const PLACEHOLDER_JWT_SECRET = 'change_this_secret';

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET is not set. Set it in your environment before starting the server.');
}

if (process.env.JWT_SECRET === PLACEHOLDER_JWT_SECRET) {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET is still set to the default placeholder. Set a strong, unique secret before running in production.');
  }
  console.warn('Warning: JWT_SECRET is set to the default placeholder. Do not use this value in production.');
}

const { connectDB } = await import('./src/config/db.js');
const { default: app } = await import('./src/app.js');

const PORT = process.env.PORT || 5000;

try {
  await connectDB();
} catch (err) {
  console.error(`MongoDB connection error: ${err.message}`);
  console.error('The server will keep running, but database-backed routes will fail until MONGO_URI is reachable.');
}

app.listen(PORT, () => {
  console.log(`PharmaTrack AI backend listening on port ${PORT}`);
});
