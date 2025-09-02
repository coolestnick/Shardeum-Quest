module.exports = (req, res) => {
  res.json({ 
    mongoDbUriExists: !!process.env.MONGODB_URI,
    jwtSecretExists: !!process.env.JWT_SECRET,
    environment: process.env.NODE_ENV || 'development'
  });
};