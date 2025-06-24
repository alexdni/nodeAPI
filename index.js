const express = require('express');
const cors = require('cors');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Node API for Vercel',
      version: '1.0.0',
      description: 'A simple API with hello and palindrome endpoints',
      contact: {
        name: 'API Support',
        email: 'support@example.com'
      }
    },
    servers: [
      {
        url: process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : `http://localhost:${PORT}`,
        description: 'Development server'
      }
    ]
  },
  apis: ['./index.js', './routes/*.js'] // Files containing annotations
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);

// Swagger UI route
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

/**
 * @swagger
 * /:
 *   get:
 *     summary: Root endpoint
 *     description: Returns a welcome message
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Welcome to the API"
 */
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the API' });
});

/**
 * @swagger
 * /hello:
 *   get:
 *     summary: Hello from Vercel
 *     description: Returns a greeting message from Vercel
 *     tags:
 *       - Greetings
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Hello from Vercel"
 */
app.get('/hello', (req, res) => {
  res.json({ message: 'Hello from Vercel' });
});

/**
 * @swagger
 * /palindrome:
 *   post:
 *     summary: Get palindrome of a word
 *     description: Returns the palindrome (reverse) of the provided word
 *     tags:
 *       - String Operations
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - word
 *             properties:
 *               word:
 *                 type: string
 *                 description: The word to reverse
 *                 example: "hello"
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 original:
 *                   type: string
 *                   example: "hello"
 *                 palindrome:
 *                   type: string
 *                   example: "olleh"
 *       400:
 *         description: Bad request - word not provided
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Please provide a word"
 */
app.post('/palindrome', (req, res) => {
  const { word } = req.body;
  
  if (!word) {
    return res.status(400).json({ error: 'Please provide a word' });
  }
  
  const palindrome = word.split('').reverse().join('');
  
  res.json({
    original: word,
    palindrome: palindrome
  });
});

/**
 * @swagger
 * /palindrome/{word}:
 *   get:
 *     summary: Get palindrome of a word (GET method)
 *     description: Returns the palindrome (reverse) of the provided word via URL parameter
 *     tags:
 *       - String Operations
 *     parameters:
 *       - in: path
 *         name: word
 *         required: true
 *         description: The word to reverse
 *         schema:
 *           type: string
 *           example: "hello"
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 original:
 *                   type: string
 *                   example: "hello"
 *                 palindrome:
 *                   type: string
 *                   example: "olleh"
 */
app.get('/palindrome/:word', (req, res) => {
  const { word } = req.params;
  const palindrome = word.split('').reverse().join('');
  
  res.json({
    original: word,
    palindrome: palindrome
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server only if not in Vercel environment
if (process.env.VERCEL !== '1') {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Swagger documentation available at http://localhost:${PORT}/api-docs`);
  });
}

// Export for Vercel
module.exports = app; 