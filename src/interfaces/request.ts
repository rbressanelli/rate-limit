import { Request } from 'express';

/**
 * Module Augmentation para estender a interface Request do Express globalmente.
 * Isso permite usar req.context em qualquer lugar sem precisar de interfaces customizadas.
 */
declare global {
  namespace Express {
    interface Request {
      context?: {
        ip: string;
        apiKey?: string;
      };
    }
  }
}

// Mantemos o export caso algum lugar ainda tente importar explicitamente
export interface RequestWithContext extends Request {}
