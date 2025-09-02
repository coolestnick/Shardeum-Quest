const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

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

const User = mongoose.models.User || mongoose.model('User', userSchema);

// Quest data
const quests = [
  { id: 1, xpReward: 100 },
  { id: 2, xpReward: 150 },
  { id: 3, xpReward: 200 },
  { id: 4, xpReward: 120 },
  { id: 5, xpReward: 180 }
];

// JWT verification
const verifyToken = (authHeader) => {
  if (!authHeader) return null;
  
  const token = authHeader.split(' ')[1];
  if (!token) return null;
  
  try {
    return jwt.verify(token, process.env.JWT_SECRET || 'shardeum-quest-super-secure-jwt-secret-2025');
  } catch (error) {
    return null;
  }
};

module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Verify JWT token
  const decoded = verifyToken(req.headers.authorization);
  if (!decoded) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    console.log('Attempting to connect to database...');
    await connectToDatabase();
    console.log('Database connected successfully');
    
    const { questId, txHash } = req.body;
    console.log('Request data:', { questId, txHash, user: decoded.walletAddress });
    
    const user = await User.findOne({ walletAddress: decoded.walletAddress });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const quest = quests.find(q => q.id === parseInt(questId));
    if (!quest) {
      return res.status(404).json({ error: 'Quest not found' });
    }

    // Check if quest already completed
    if (user.completedQuests.includes(parseInt(questId))) {
      return res.status(400).json({ error: 'Quest already completed' });
    }

    // Add quest to completed and update XP
    user.completedQuests.push(parseInt(questId));
    user.totalXP += quest.xpReward;
    await user.save();

    res.json({
      success: true,
      newXP: user.totalXP,
      questReward: quest.xpReward,
      completedQuests: user.completedQuests
    });
  } catch (error) {
    console.error('Complete quest error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message,
      mongoUri: !!process.env.MONGODB_URI
    });
  }
};