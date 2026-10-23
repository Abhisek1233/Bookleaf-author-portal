import express from 'express';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';

import routes from './routes/index.js';
import { errorHandler } from './middleware/errorHandler.middleware.js';
import { initializeSocket } from './socket/socket.server.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from both apps/api/.env and repo root .env
dotenv.config();
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const app = express();
const httpServer = http.createServer(app);

// Mount Socket.IO
initializeSocket(httpServer);

// Security & Parsing Middleware
app.use(helmet({
  contentSecurityPolicy: false // Allows Swagger UI to render assets correctly
}));

const clientOrigin = process.env.CLIENT_ORIGIN;
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. mobile apps, curl, server-to-server, Swagger UI)
    if (!origin) return callback(null, true);
    if (!clientOrigin || clientOrigin === '*') return callback(null, true);
    
    const whitelist = clientOrigin.split(',').map(s => s.trim().replace(/\/+$/, ''));
    whitelist.push('http://localhost:5173', 'http://127.0.0.1:5173');
    
    const cleanOrigin = origin.replace(/\/+$/, '');
    if (whitelist.includes(cleanOrigin) || cleanOrigin.endsWith('.onrender.com') || cleanOrigin.endsWith('.vercel.app')) {
      return callback(null, true);
    }
    return callback(null, true);
  },
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Swagger API Documentation
try {
  const swaggerDoc = YAML.load(path.join(__dirname, 'swagger/swagger.yaml'));
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDoc));
} catch (err) {
  console.warn('Swagger documentation could not be loaded:', err.message);
}

// Root Redirect to Swagger Documentation
app.get('/', (req, res) => {
  res.redirect('/api/docs');
});

// REST API Routes
app.use(process.env.API_PREFIX || '/api/v1', routes);

// Centralized Error Handling
app.use(errorHandler);

const PORT = parseInt(process.env.PORT, 10) || 4000;

if (process.env.NODE_ENV !== 'test') {
  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`====================================================`);
    console.log(` BookLeaf Publishing Support API running on port ${PORT}`);
    console.log(` REST Endpoints: http://localhost:${PORT}/api/v1`);
    console.log(` OpenAPI Docs:   http://localhost:${PORT}/api/docs`);
    console.log(` WebSocket:      ws://localhost:${PORT}`);
    console.log(`====================================================`);
  });
}

export { app, httpServer };
