import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import { join } from 'node:path';
import { DatabaseService } from './database.service';
import { config } from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// Load environment variables
config();

const browserDistFolder = join(import.meta.dirname, '../browser');

const app = express();
const angularApp = new AngularNodeAppEngine();

// Initialize database connection
const databaseService = DatabaseService.getInstance();

// Connect to database immediately
databaseService.connect().catch((error) => {
  console.error('Database connection failed:', error);
});

// Define User Schema for authentication (check if model already exists to avoid conflicts)
const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
}, { timestamps: true });

const User = mongoose.models['User'] || mongoose.model('User', UserSchema);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/**
 * Authentication API endpoints
 */
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    console.log('Login attempt:', { username, passwordLength: password?.length });
    console.log('MongoDB connection state:', mongoose.connection.readyState); // 0=disconnected, 1=connected, 2=connecting, 3=disconnecting
    console.log('Database name:', mongoose.connection.name);

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username and password are required'
      });
    }

    // Find user in database
    const user = await User.findOne({ username: username.toLowerCase() }).exec();

    console.log('User found:', user ? 'Yes' : 'No');
    if (user) {
      console.log('User details:', { id: user._id, username: user.username, email: user.email });
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password'
      });
    }

    // Compare password with hashed password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    console.log('Password valid:', isPasswordValid);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password'
      });
    }

    // Generate token (using simple timestamp for now - should use JWT in production)
    const token = Buffer.from(`${user._id}:${Date.now()}`).toString('base64');

    return res.json({
      success: true,
      message: 'Login successful',
      token: token,
      user: {
        id: user._id.toString(),
        username: user.username,
        email: user.email
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

app.post('/api/auth/logout', (req, res) => {
  res.json({
    success: true,
    message: 'Logout successful'
  });
});

app.get('/api/auth/validate', (req, res) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return res.json({ valid: false });
  }

  // TODO: Implement actual token validation
  return res.json({
    valid: true,
    user: {
      id: '1',
      username: 'admin',
      email: 'admin@example.com'
    }
  });
});

/**
 * Serve static files from /browser
 */
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);

/**
 * Handle all other requests by rendering the Angular application.
 */
app.use((req, res, next) => {
  angularApp
    .handle(req)
    .then((response) =>
      response ? writeResponseToNodeResponse(response, res) : next(),
    )
    .catch(next);
});

/**
 * Start the server if this module is the main entry point, or it is ran via PM2.
 * The server listens on the port defined by the `PORT` environment variable, or defaults to 4000.
 */
if (isMainModule(import.meta.url) || process.env['pm_id']) {
  const port = process.env['PORT'] || 4000;

  // Connect to database before starting server
  databaseService.connect()
    .then(() => {
      app.listen(port, (error) => {
        if (error) {
          throw error;
        }
        console.log(`Node Express server listening on http://localhost:${port}`);
      });
    })
    .catch((error) => {
      console.error('Failed to connect to database:', error);
      process.exit(1);
    });
}

/**
 * Request handler used by the Angular CLI (for dev-server and during build) or Firebase Cloud Functions.
 */
export const reqHandler = createNodeRequestHandler(app);
