const mongoose = require('mongoose');

// MongoDB connection
let cachedConnection = null;

async function connectToDatabase() {
  if (cachedConnection && mongoose.connection.readyState === 1) {
    return cachedConnection;
  }

  try {
    const connection = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      maxPoolSize: 5,
      bufferCommands: false,
    });

    cachedConnection = connection;
    return connection;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
}

// User Schema
const userSchema = new mongoose.Schema({
  walletAddress: { type: String, required: true, unique: true },
  username: { type: String, default: '' },
  totalXP: { type: Number, default: 0 },
  completedQuests: [{ type: Number }],
  lastActive: { type: Date, default: Date.now }
});

// Get existing model or create new one
let User;
try {
  User = mongoose.model('User');
} catch {
  User = mongoose.model('User', userSchema);
}

module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Try to connect to MongoDB
    try {
      await connectToDatabase();
      
      const users = await User.find({})
        .sort({ totalXP: -1 })
        .limit(10)
        .select('walletAddress username totalXP');

      const leaderboard = users.map((user, index) => ({
        rank: index + 1,
        walletAddress: user.walletAddress,
        username: user.username || 'Anonymous',
        totalXP: user.totalXP
      }));

      res.json(leaderboard);
    } catch (dbError) {
      // If MongoDB fails, return empty leaderboard
      console.error('MongoDB error:', dbError);
      res.json([]);
    }
  } catch (error) {
    console.error('Leaderboard error:', error);
    res.json([]);
  }
};