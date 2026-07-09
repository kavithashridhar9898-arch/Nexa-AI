import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { db } from './config/db';
import authRoutes from './routes/auth.routes';
import workflowRoutes from './routes/workflow.routes';
import apiKeyRoutes from './routes/apikey.routes';
import notificationRoutes from './routes/notification.routes';
import { errorHandler } from './middlewares/error.middleware';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security Headers
app.use(helmet());

// Cross Origin Resource Sharing
app.use(
  cors({
    origin: '*', // In production, replace with specific allowed origins (e.g., frontend host URL)
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);

// Logging
app.use(morgan('dev'));

// Body Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate Limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Limit each IP to 200 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests from this IP, please try again after 15 minutes.' }
});

app.use('/api/', apiLimiter);

// Health Check
app.get('/api/health', async (req, res) => {
  try {
    // Basic DB check
    await db.query('SELECT 1');
    res.status(200).json({
      status: 'healthy',
      database: process.env.DB_TYPE || 'sqlite',
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({
      status: 'unhealthy',
      error: 'Database connection failed',
      timestamp: new Date().toISOString()
    });
  }
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/workflows', workflowRoutes);
app.use('/api/api-keys', apiKeyRoutes);
app.use('/api/notifications', notificationRoutes);

// Fallback Route
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Endpoint not found.' });
});

// Error Handler Middleware
app.use(errorHandler);

// Database Boot & Server Startup
const startServer = async () => {
  try {
    await db.initialize();
    
    app.listen(PORT, () => {
      console.log(`============================================================`);
      console.log(`🚀 Nexus AI Backend running in [${process.env.NODE_ENV || 'development'}] mode`);
      console.log(`🔗 API Endpoint: http://localhost:${PORT}`);
      console.log(`============================================================`);
    });
  } catch (error) {
    console.error('❌ Failed to start Nexus AI backend server:', error);
    process.exit(1);
  }
};

startServer();
