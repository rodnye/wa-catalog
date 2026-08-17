import express, { Express } from 'express';
import { IChannelAdapter } from '@bot/types';
import QRCode from 'qrcode';

export const createServer = (
  adapter: IChannelAdapter,
  port: number,
): Express => {
  const app = express();
  app.use(express.json());

  app.get('/auth/qr', async (req, res) => {
    const qrText = adapter.getLatestQR();
    if (!qrText) {
      return res
        .status(404)
        .send('No QR code available. The bot might already be connected.');
    }

    const format = req.query.format === 'text' ? 'text' : 'svg';

    if (format === 'text') {
      res.type('text/plain').send(qrText);
    } else {
      try {
        const svg = await QRCode.toString(qrText, { type: 'svg' });
        res.type('image/svg+xml').send(svg);
      } catch (err) {
        res.status(500).send('Error generating QR SVG');
      }
    }
  });

  app.post('/webhook', (req, res) => {
    res.status(200).send('OK');
  });

  app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  app.listen(port, () => {
    console.log(`HTTP Server running on port ${port}`);
    console.log(`QR Code endpoint: http://localhost:${port}/auth/qr`);
  });

  return app;
};
