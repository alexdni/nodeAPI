const express = require('express');
const router = express.Router();
const { auth, db } = require('../config/firebase');
const { verifyToken } = require('../middleware/auth');

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         uid:
 *           type: string
 *           description: Firebase user ID
 *         email:
 *           type: string
 *           format: email
 *         displayName:
 *           type: string
 *         photoURL:
 *           type: string
 *         emailVerified:
 *           type: boolean
 *         createdAt:
 *           type: string
 *           format: date-time
 *         lastLoginAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     description: Creates a new user account with email and password
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 6
 *                 example: securepassword123
 *               displayName:
 *                 type: string
 *                 example: John Doe
 *               photoURL:
 *                 type: string
 *                 example: https://example.com/photo.jpg
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Bad request - validation error
 *       409:
 *         description: User already exists
 */
router.post('/register', async (req, res) => {
  try {
    const { email, password, displayName, photoURL } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'Email and password are required'
      });
    }
    
    if (password.length < 6) {
      return res.status(400).json({
        error: 'Password too short',
        message: 'Password must be at least 6 characters long'
      });
    }
    
    try {
      // Create user in Firebase Auth
      const userRecord = await auth.createUser({
        email,
        password,
        displayName: displayName || undefined,
        photoURL: photoURL || undefined,
        emailVerified: false
      });
      
      // Create user document in Firestore
      const userData = {
        uid: userRecord.uid,
        email: userRecord.email,
        displayName: displayName || null,
        photoURL: photoURL || null,
        emailVerified: false,
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
        profile: {
          bio: '',
          preferences: {}
        }
      };
      
      await db.collection('users').doc(userRecord.uid).set(userData);
      
      res.status(201).json({
        message: 'User created successfully',
        user: {
          uid: userRecord.uid,
          email: userRecord.email,
          displayName: userRecord.displayName || null,
          photoURL: userRecord.photoURL || null,
          emailVerified: userRecord.emailVerified
        }
      });
    } catch (error) {
      if (error.code === 'auth/email-already-exists') {
        return res.status(409).json({
          error: 'User already exists',
          message: 'An account with this email already exists'
        });
      }
      throw error;
    }
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      error: 'Registration failed',
      message: 'An error occurred during registration'
    });
  }
});

/**
 * @swagger
 * /auth/user:
 *   get:
 *     summary: Get current user profile
 *     description: Returns the profile of the authenticated user
 *     tags:
 *       - Authentication
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized - invalid or missing token
 *       404:
 *         description: User not found
 */
router.get('/user', verifyToken, async (req, res) => {
  try {
    const userDoc = await db.collection('users').doc(req.user.uid).get();
    
    if (!userDoc.exists) {
      return res.status(404).json({
        error: 'User not found',
        message: 'User profile not found in database'
      });
    }
    
    const userData = userDoc.data();
    res.json({ user: userData });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      error: 'Failed to get user',
      message: 'An error occurred while fetching user data'
    });
  }
});

/**
 * @swagger
 * /auth/user:
 *   put:
 *     summary: Update user profile
 *     description: Updates the profile of the authenticated user
 *     tags:
 *       - Authentication
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               displayName:
 *                 type: string
 *                 example: John Doe
 *               photoURL:
 *                 type: string
 *                 example: https://example.com/photo.jpg
 *               bio:
 *                 type: string
 *                 example: Software developer passionate about APIs
 *               preferences:
 *                 type: object
 *                 example: { theme: "dark", notifications: true }
 *     responses:
 *       200:
 *         description: User profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized - invalid or missing token
 */
router.put('/user', verifyToken, async (req, res) => {
  try {
    const { displayName, photoURL, bio, preferences } = req.body;
    const updates = {
      lastUpdatedAt: new Date().toISOString()
    };
    
    // Update Firebase Auth profile if needed
    const authUpdates = {};
    if (displayName !== undefined) {
      authUpdates.displayName = displayName;
      updates.displayName = displayName;
    }
    if (photoURL !== undefined) {
      authUpdates.photoURL = photoURL;
      updates.photoURL = photoURL;
    }
    
    if (Object.keys(authUpdates).length > 0) {
      await auth.updateUser(req.user.uid, authUpdates);
    }
    
    // Update Firestore profile
    if (bio !== undefined) {
      updates['profile.bio'] = bio;
    }
    if (preferences !== undefined) {
      updates['profile.preferences'] = preferences;
    }
    
    await db.collection('users').doc(req.user.uid).update(updates);
    
    // Get updated user data
    const userDoc = await db.collection('users').doc(req.user.uid).get();
    const userData = userDoc.data();
    
    res.json({
      message: 'Profile updated successfully',
      user: userData
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      error: 'Failed to update user',
      message: 'An error occurred while updating user data'
    });
  }
});

/**
 * @swagger
 * /auth/user:
 *   delete:
 *     summary: Delete user account
 *     description: Deletes the authenticated user's account
 *     tags:
 *       - Authentication
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User account deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Account deleted successfully
 *       401:
 *         description: Unauthorized - invalid or missing token
 */
router.delete('/user', verifyToken, async (req, res) => {
  try {
    // Delete user data from Firestore
    await db.collection('users').doc(req.user.uid).delete();
    
    // Delete user from Firebase Auth
    await auth.deleteUser(req.user.uid);
    
    res.json({
      message: 'Account deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      error: 'Failed to delete user',
      message: 'An error occurred while deleting user account'
    });
  }
});

/**
 * @swagger
 * /auth/verify-token:
 *   post:
 *     summary: Verify Firebase ID token
 *     description: Verifies a Firebase ID token and returns user information
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - idToken
 *             properties:
 *               idToken:
 *                 type: string
 *                 description: Firebase ID token to verify
 *     responses:
 *       200:
 *         description: Token is valid
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 valid:
 *                   type: boolean
 *                   example: true
 *                 user:
 *                   type: object
 *                   properties:
 *                     uid:
 *                       type: string
 *                     email:
 *                       type: string
 *                     emailVerified:
 *                       type: boolean
 *       401:
 *         description: Invalid token
 */
router.post('/verify-token', async (req, res) => {
  try {
    const { idToken } = req.body;
    
    if (!idToken) {
      return res.status(400).json({
        error: 'Missing token',
        message: 'ID token is required'
      });
    }
    
    try {
      const decodedToken = await auth.verifyIdToken(idToken);
      res.json({
        valid: true,
        user: {
          uid: decodedToken.uid,
          email: decodedToken.email,
          emailVerified: decodedToken.email_verified
        }
      });
    } catch (error) {
      res.status(401).json({
        valid: false,
        error: 'Invalid token',
        message: 'The provided token is invalid or expired'
      });
    }
  } catch (error) {
    console.error('Verify token error:', error);
    res.status(500).json({
      error: 'Verification failed',
      message: 'An error occurred during token verification'
    });
  }
});

module.exports = router; 