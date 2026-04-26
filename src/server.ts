import express, { Request, Response } from 'express';
import { dbManager } from './database/dbManager';
import { rateLimitMiddleware } from './middlewares/rateLimitMiddleware';
import './interfaces/request'; // Importante para carregar a extensão de tipos
import { GatewayController } from './controllers/gatewayController';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(rateLimitMiddleware);

// Initialize Database
dbManager.initialize().then(() => {
  // Health Check
  app.get('/', (req: Request, res: Response) => {
    res.json({ 
      message: 'Rate Limiter API is running',
      context: req.context
    });
  });

  // Protected Gateway Route
  // app.get('/api/v1/endpoint-protegido', GatewayController.handleProtectedRequest);
  app.all('/api/v1/users', GatewayController.proxyToUsers);

  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
}).catch(err => {
  console.error('Failed to initialize database:', err);
  process.exit(1);
});
