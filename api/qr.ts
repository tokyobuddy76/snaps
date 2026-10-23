import type { IncomingMessage, ServerResponse } from 'http';

interface VercelRequest extends IncomingMessage {
  query?: Record<string, string | string[]>;
  url?: string;
}

interface VercelResponse extends ServerResponse {
  status?: (code: number) => VercelResponse;
  json?: (data: any) => void;
  send?: (data: any) => void;
}

/**
 * Serverless API handler connecting to api.qrserver.com
 * Endpoint: GET https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=https%3A%2F%2Fyour-app.vercel.app
 * No API key required.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // Parse query params safely
    const parsedUrl = new URL(req.url || '/', 'http://localhost');
    const queryData = req.query?.data || parsedUrl.searchParams.get('data');
    const querySize = req.query?.size || parsedUrl.searchParams.get('size');
    const format = req.query?.format || parsedUrl.searchParams.get('format');

    // Default parameters matching requirements
    const targetData = typeof queryData === 'string' && queryData.trim().length > 0
      ? queryData.trim()
      : 'https://your-app.vercel.app';
    const targetSize = typeof querySize === 'string' && /^\d+x\d+$/.test(querySize)
      ? querySize
      : '240x240';

    // Construct upstream endpoint URL
    const upstreamUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${targetSize}&data=${encodeURIComponent(targetData)}`;

    // Fetch from api.qrserver.com
    const upstreamResponse = await fetch(upstreamUrl);

    if (!upstreamResponse.ok) {
      const errText = await upstreamResponse.text().catch(() => 'Upstream service error');
      if (typeof res.status === 'function') res.status(upstreamResponse.status);
      else res.statusCode = upstreamResponse.status;
      return res.end(JSON.stringify({ error: 'Failed to generate QR code', details: errText }));
    }

    const arrayBuffer = await upstreamResponse.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // If client requested JSON metadata
    if (format === 'json') {
      const base64 = buffer.toString('base64');
      const dataUri = `data:image/png;base64,${base64}`;

      if (typeof res.setHeader === 'function') {
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=86400');
      }
      if (typeof res.status === 'function') res.status(200);
      else res.statusCode = 200;

      const responsePayload = {
        success: true,
        endpoint: upstreamUrl,
        size: targetSize,
        data: targetData,
        dataUri,
      };

      if (typeof res.json === 'function') return res.json(responsePayload);
      return res.end(JSON.stringify(responsePayload));
    }

    // Direct image stream (image/png)
    if (typeof res.setHeader === 'function') {
      res.setHeader('Content-Type', 'image/png');
      res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=86400');
      res.setHeader('Content-Length', buffer.length.toString());
      res.setHeader('X-QR-Target', targetData);
    }

    if (typeof res.status === 'function') res.status(200);
    else res.statusCode = 200;

    if (typeof res.send === 'function') {
      return res.send(buffer);
    }
    return res.end(buffer);
  } catch (error: any) {
    console.error('QR Serverless handler error:', error);
    if (typeof res.status === 'function') res.status(500);
    else res.statusCode = 500;
    return res.end(JSON.stringify({ error: 'Internal Server Error', message: error?.message || 'Unknown error' }));
  }
}
