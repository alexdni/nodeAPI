const { auth } = require('../config/firebase');

/**
 * Middleware to verify Firebase ID token
 * Extracts and verifies the token from the Authorization header
 */
const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'No token provided',
        message: 'Authorization header with Bearer token is required'
      });
    }
    
    const idToken = authHeader.split('Bearer ')[1];
    
    try {
      // Verify the ID token
      const decodedToken = await auth.verifyIdToken(idToken);
      
      // Add user info to request object
      req.user = {
        uid: decodedToken.uid,
        email: decodedToken.email,
        emailVerified: decodedToken.email_verified,
        name: decodedToken.name,
        picture: decodedToken.picture
      };
      
      next();
    } catch (error) {
      console.error('Token verification error:', error);
      return res.status(401).json({
        error: 'Invalid token',
        message: 'The provided token is invalid or expired'
      });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({
      error: 'Authentication error',
      message: 'An error occurred during authentication'
    });
  }
};

/**
 * Optional authentication middleware
 * Verifies token if present, but allows request to proceed without token
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const idToken = authHeader.split('Bearer ')[1];
      
      try {
        const decodedToken = await auth.verifyIdToken(idToken);
        req.user = {
          uid: decodedToken.uid,
          email: decodedToken.email,
          emailVerified: decodedToken.email_verified,
          name: decodedToken.name,
          picture: decodedToken.picture
        };
      } catch (error) {
        // Invalid token, but continue without user
        console.log('Invalid token in optional auth:', error.message);
      }
    }
    
    next();
  } catch (error) {
    console.error('Optional auth middleware error:', error);
    next();
  }
};

module.exports = {
  verifyToken,
  optionalAuth
}; 