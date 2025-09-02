const mongoose = require('mongoose');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  try {
    // Log environment check
    const hasMongoUri = !!process.env.MONGODB_URI;
    
    if (!hasMongoUri) {
      return res.json({
        success: false,
        error: 'MONGODB_URI not found in environment',
        env: Object.keys(process.env).filter(key => key.includes('MONGO') || key.includes('DB'))
      });
    }
    
    // Try to connect
    const connection = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
    });
    
    // Check connection state
    const isConnected = mongoose.connection.readyState === 1;
    
    res.json({
      success: true,
      connected: isConnected,
      host: mongoose.connection.host,
      database: mongoose.connection.name,
      readyState: mongoose.connection.readyState
    });
    
  } catch (error) {
    res.json({
      success: false,
      error: error.message,
      stack: error.stack
    });
  }
};