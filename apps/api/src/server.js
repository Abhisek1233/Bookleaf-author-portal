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

const allowedOrigins = process.env.CLIENT_ORIGIN
  ? [process.env.CLIENT_ORIGIN, 'http://localhost:5173', 'http://127.0.0.1:5173']
  : '*';

app.use(cors({
  origin: allowedOrigins,
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

// REST API Routes
app.use(process.env.API_PREFIX || '/api/v1', routes);

// Centralized Error Handling
app.use(errorHandler);

const PORT = parseInt(process.env.PORT, 10) || 4000;

if (process.env.NODE_ENV !== 'test') {
  httpServer.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(` BookLeaf Publishing Support API running on port ${PORT}`);
    console.log(` REST Endpoints: http://localhost:${PORT}/api/v1`);
    console.log(` OpenAPI Docs:   http://localhost:${PORT}/api/docs`);
    console.log(` WebSocket:      ws://localhost:${PORT}`);
    console.log(`====================================================`);
  });
}

export { app, httpServer };
