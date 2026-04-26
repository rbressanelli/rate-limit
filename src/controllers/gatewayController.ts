import { Request, Response } from 'express';

/**
 * Controller to simulate an API Gateway routing to a downstream service.
 */
// export class GatewayController {
//   /**
//    * Handles requests to protected endpoints.
//    * Simulates processing and communication with a backend service.
//    */
//   public static async handleProtectedRequest(req: Request, res: Response) {
//     const context = req.context || { ip: 'unknown' };

//     // Simulate internal "routing" logic
//     console.log(`[Gateway] Routing request from ${context.ip}${context.apiKey ? ` (API Key: ${context.apiKey})` : ''} to Downstream Service...`);

//     // Simulate backend response
//     return res.status(200).json({
//       status: 'success',
//       data: {
//         message: 'Welcome to the protected resource!',
//         timestamp: new Date().toISOString(),
//         service: 'Core-Backend-v1',
//         authenticated_as: {
//           id: context.apiKey || 'anonymous',
//           method: context.apiKey ? 'API_KEY' : 'IP_ADDRESS'
//         }
//       }
//     });
//   }
// }

// src/controllers/gatewayController.ts
export class GatewayController {
  public static async proxyToUsers(req: Request, res: Response) {
    // Definimos onde está a API real de usuários
    const USERS_API_URL = 'http://localhost:3001/api/v1/users';

    try {
      console.log(`[Gateway] Repassando requisição para: ${USERS_API_URL}`);

      // Fazemos a chamada para a API interna
      const response = await fetch(USERS_API_URL, {
        method: req.method,
        headers: {
          'Content-Type': 'application/json',
          // Repassamos headers importantes se houver (ex: Auth)
          'Authorization': req.headers.authorization || ''
        },
        // Se for POST/PUT, repassamos o corpo da requisição
        body: ['POST', 'PUT', 'PATCH'].includes(req.method) ? JSON.stringify(req.body) : undefined
      });

      const data = await response.json();

      // 3. A resposta é redirecionada para o front? 
      // SIM! O Gateway recebe da API interna e entrega para o Front.
      return res.status(response.status).json(data);

    } catch (error) {
      return res.status(502).json({ error: 'Serviço de Usuários indisponível' });
    }
  }
}

