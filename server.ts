import express from "express";
import { createServer as createViteServer } from "vite";
import ytdl from "ytdl-core";
import path from "path";
import { v4 as uuidv4 } from 'uuid';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2025-02-24.acacia' });
const downloads = new Map();

async function startServer() {
  const app = express();
  const PORT = 3000;
  app.use(express.json());

  // Stripe Checkout
  app.post("/api/create-checkout-session", async (req, res) => {
    const { userId } = req.body;
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: { name: 'Remove Ads' },
          unit_amount: 500, // $5.00
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${process.env.APP_URL}/settings?success=true`,
      cancel_url: `${process.env.APP_URL}/settings?canceled=true`,
      client_reference_id: userId,
    });
    res.json({ id: session.id });
  });

  // Stripe Webhook
  app.post("/api/webhook", express.raw({type: 'application/json'}), async (req, res) => {
    const sig = req.headers['stripe-signature']!;
    let event;
    try {
      event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
    } catch (err: any) {
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as any;
      console.log(`User ${session.client_reference_id} purchased Remove Ads`);
      // TODO: Firebase Admin update: setUserPro(session.client_reference_id)
    }
    res.json({received: true});
  });

  // Start download
  app.post("/api/download/start", async (req, res) => {
    const { url } = req.body;
    if (!url || !ytdl.validateURL(url)) return res.status(400).json({ error: "Invalid URL" });
    
    const id = uuidv4();
    const stream = ytdl(url, { filter: 'audioandvideo', quality: 'highest' });
    
    let downloadInfo = { 
      stream, 
      status: 'downloading',
      bytesDownloaded: 0,
      totalBytes: 0,
      speed: 0,
      lastBytes: 0,
      lastTime: Date.now()
    };
    
    stream.on('progress', (chunk, downloaded, total) => {
      downloadInfo.bytesDownloaded = downloaded;
      downloadInfo.totalBytes = total;
      const now = Date.now();
      const duration = (now - downloadInfo.lastTime) / 1000;
      if (duration > 1) {
        downloadInfo.speed = (downloaded - downloadInfo.lastBytes) / duration;
        downloadInfo.lastBytes = downloaded;
        downloadInfo.lastTime = now;
      }
    });

    stream.on('end', () => {
      downloadInfo.status = 'completed';
    });
    stream.on('error', () => {
      downloadInfo.status = 'failed';
    });
    
    downloads.set(id, downloadInfo);
    res.json({ id });
  });

  // Get status
  app.get("/api/download/:id/status", (req, res) => {
    const { id } = req.params;
    const download = downloads.get(id);
    if (!download) return res.status(404).json({ error: "Download not found" });
    res.json({ 
      status: download.status,
      progress: download.totalBytes ? (download.bytesDownloaded / download.totalBytes) * 100 : 0,
      speed: download.speed // bytes per second
    });
  });
  app.post("/api/download/:id/:action", (req, res) => {
    const { id, action } = req.params;
    const download = downloads.get(id);
    if (!download) return res.status(404).json({ error: "Download not found" });

    if (action === 'pause') { download.stream.pause(); download.status = 'paused'; }
    else if (action === 'resume') { download.stream.resume(); download.status = 'downloading'; }
    else if (action === 'cancel') { download.stream.destroy(); downloads.delete(id); }
    
    res.json({ status: download.status });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
