import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import routes from './routes/index.js';
import { errorHandler, notFound } from './middleware/error.middleware.js';

const app = express();

// Fallback to localhost:3000 to prevent CORS blocking during local development
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true,
  })
);

app.use(express.json());
app.use(morgan('dev'));

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({ success: true, message: 'Naimat Bazaar API is running' });
});

// Mount all API routes
app.use('/api', routes);

app.use(notFound);
app.use(errorHandler);

export default app;