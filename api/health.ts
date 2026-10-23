import type { IncomingMessage, ServerResponse } from 'http';

interface VercelRequest extends IncomingMessage {
  query?: Record<string, string | string[]>;
  body?: any;
}

interface VercelResponse extends ServerResponse {
  status?: (code: number) => VercelResponse;
  json?: (data: any) => void;
  send?: (data: any) => void;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const payload = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'SNAPs Repair Photo Management API',
    environment: process.env.NODE_ENV || 'production',
    uptime: process.uptime ? Math.floor(process.uptime()) : 0,
  };

  if (typeof res.setHeader === 'function') {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'no-store, max-age=0');
  }

  if (typeof res.status === 'function') {
    res.status(200);
  } else {
    res.statusCode = 200;
  }

  if (typeof res.json === 'function') {
    res.json(payload);
  } else {
    res.end(JSON.stringify(payload, null, 2));
  }
}
