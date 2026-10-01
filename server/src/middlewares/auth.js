const { auth } = require('../config/firebase');
const User = require('../models/User');

const verifyFirebaseToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No bearer token provided.',
      });
    }

    const token = authHeader.split(' ')[1];
    let decodedToken;

    if (auth) {
      try {
        decodedToken = await auth.verifyIdToken(token);
      } catch (fbError) {
        return res.status(401).json({
          success: false,
          message: 'Invalid or expired authentication token.',
          error: fbError.message,
        });
      }
    } else {
      // In local dev/mock mode when service account is not yet configured,
      // allow base64 json token or mock payload
      try {
        decodedToken = JSON.parse(Buffer.from(token, 'base64').toString('utf-8'));
      } catch (e) {
        decodedToken = {
          uid: token,
          email: `${token}@example.com`,
          name: token,
        };
      }
    }

    if (!decodedToken || !decodedToken.uid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token payload.',
      });
    }

    // Find or sync user in MongoDB
    let user = await User.findOne({ firebaseUid: decodedToken.uid });
    if (!user) {
      user = await User.create({
        firebaseUid: decodedToken.uid,
        email: decodedToken.email || `${decodedToken.uid}@example.com`,
        displayName: decodedToken.name || decodedToken.displayName || 'Anonymous User',
        photoURL: decodedToken.picture || decodedToken.photoURL || '',
        role: 'requester',
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account is deactivated. Please contact support.',
      });
    }

    req.user = user;
    req.firebaseUser = decodedToken;
    next();
  } catch (error) {
    console.error('[Auth Middleware Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Authentication error',
      error: error.message,
    });
  }
};

const optionalAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }
  return verifyFirebaseToken(req, res, next);
};

module.exports = {
  verifyFirebaseToken,
  optionalAuth,
};

