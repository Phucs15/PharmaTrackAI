import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import apiRoutes from './routes/index.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

const app = express();

const allowedOrigins = (process.env.CLIENT_URL || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

if (allowedOrigins.length === 0) {
  console.warn(
    'CLIENT_URL is not set - CORS will reject all cross-origin requests. Set CLIENT_URL to the frontend origin(s) to allow it through.'
  );
}

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
// credentials: true is required so the browser sends the HttpOnly refresh-token cookie on cross-origin requests.
app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(cookieParser());
app.use(express.json());

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
app.use('/api', apiRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
