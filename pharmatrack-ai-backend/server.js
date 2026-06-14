import dotenv from 'dotenv';

dotenv.config();

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
