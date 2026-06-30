import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import multer from 'multer';
import * as fs from 'fs';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { z } from 'zod';
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import {
  uploadImageToComfyUI,
  submitComfyUIWorkflow,
  pollComfyUIForHistory,
  getComfyUIImageURL
} from './lib/comfyui';

// Load environment variables for local node environment (server.ts)
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure multer for handling file uploads (in memory)
const upload = multer({ storage: multer.memoryStorage() });

// Initialize Supabase Client
const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.warn("⚠️ WARNING: VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are missing from environment variables.");
}

export const supabase = createClient(supabaseUrl, supabaseKey);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Security and Utility Middleware
  app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  })); // Secure HTTP headers (CSP disabled for Vite HMR compatibility)
  
  const allowedOrigins = process.env.VITE_ALLOWED_ORIGIN ? process.env.VITE_ALLOWED_ORIGIN.split(',') : ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:5173'];
  app.use(cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error('CORS policy violation'), false);
      }
    }
  }));
  app.use(morgan('dev')); // Structured request logging

  // ── AI PROXY (must be before rate limiter to avoid conflicts) ────────────
  // NOTE: Express strips the mount path before passing req.url to middleware,
  //       so req.url here is already '/chat', NOT '/api/ai-assistant/chat'.
  //       We simply prepend '/api/v1' to match the FastAPI router prefix.
  app.use(
    '/api/ai-assistant',
    createProxyMiddleware({
      target: 'http://127.0.0.1:8000',
      changeOrigin: true,
      on: {
        proxyReq: (proxyReq, req) => {
          // req.url = '/chat'  →  proxyReq.path = '/api/v1/chat'
          const newPath = `/api/v1${req.url}`;
          console.log(`[AI Proxy] Rewriting path: ${req.url} → ${newPath}`);
          proxyReq.path = newPath;
        },
        error: (err, req, res: any) => {
          console.error('[AI Proxy Error]', err.message);
          res.status(502).json({ success: false, error: 'AI Assistant is currently unavailable. Is the Python server running?' });
        }
      }
    })
  );

  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  // Rate Limiting (apply to all /api routes)
  const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
    message: { success: false, error: 'Too many requests from this IP, please try again after 15 minutes' },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  });
  app.use('/api/', apiLimiter);

  // ── SERVE FALLBACK AI IMAGES ────────────
  const aiDataPath = path.join(process.cwd(), '../AI_FASHION_ASSISSTANT-NEW/data');
  app.use('/data', express.static(aiDataPath));



  // --- ZOD SCHEMAS FOR VALIDATION ---
  const CategorySchema = z.object({
    id: z.string().optional(),
    name: z.string().min(1, 'Name is required'),
    slug: z.string().min(1, 'Slug is required'),
    description: z.string().optional().nullable(),
    parentId: z.string().optional().nullable(),
    image: z.string().url('Must be a valid URL').optional().nullable(),
  });

  const ProductSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    price: z.number().positive('Price must be positive'),
    category: z.string().min(1, 'Category is required'),
    image: z.string().min(1, 'Image is required'),
    image2: z.string().optional().nullable(),
    image3: z.string().optional().nullable(),
    image4: z.string().optional().nullable(),
    image5: z.string().optional().nullable(),
    video: z.string().optional().nullable(),
    video2: z.string().optional().nullable(),
    description: z.string().optional().nullable(),
    is_available: z.boolean().default(true),
    sizeChart: z.record(z.string(), z.any()).optional().nullable(),
    gender: z.string().optional().nullable(),
    brand: z.string().optional().nullable(),
    occasion: z.string().optional().nullable(),
    season: z.string().optional().nullable(),
    fabric: z.string().optional().nullable(),
    type: z.string().optional().nullable(),
  });

  const OrderSchema = z.object({
    email: z.string().email('Valid email is required'),
    total: z.number().nonnegative('Total must be zero or positive'),
    items: z.array(z.any()).min(1, 'At least one item is required in the order'),
  });

  const ServiceSchema = z.object({
    title: z.string().min(1, 'Title is required'),
    description: z.string().optional().nullable(),
    image_url: z.string().url('Must be a valid URL').optional().nullable(),
    link: z.string().optional().nullable(),
  });

  const ContactSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('Valid email is required'),
    subject: z.string().optional().nullable(),
    message: z.string().min(1, 'Message is required'),
    is_read: z.boolean().default(false).optional(),
  });

  const AuthSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
    name: z.string().optional(),
  });

  const ProfileSchema = z.object({
    name: z.string().optional(),
    phone: z.string().optional().nullable(),
    address: z.string().optional().nullable(),
    avatar_url: z.string().optional().nullable(),
  });
  // ----------------------------------

  // Virtual Try-On API Route
  const workflowPath = path.join(process.cwd(), 'deploy1.json');
  app.post("/api/try-on", upload.single('userImage'), async (req: any, res: any) => {
    try {
      const userImageFile = req.file;
      const garmentImageStr = req.body.garmentImageUrl;

      if (!userImageFile || !garmentImageStr) {
        return res.status(400).json({ success: false, error: 'Missing images' });
      }

      // Determine the garment type for dynamic masking
      let garmentPrompt = "clothing";
      if (garmentImageStr.toLowerCase().includes("coat")) {
        garmentPrompt = "coat";
      } else if (garmentImageStr.toLowerCase().includes("dress")) {
        garmentPrompt = "dress";
      } else if (garmentImageStr.toLowerCase().includes("blazer")) {
        garmentPrompt = "blazer";
      } else if (garmentImageStr.toLowerCase().includes("shirt")) {
        garmentPrompt = "shirt";
      }

      console.log(`[IDM-VTON] Generating for product type mask: ${garmentPrompt}`);

      // Read the base workflow
      const workflowFileStr = fs.readFileSync(workflowPath, 'utf8');
      const workflowObj = JSON.parse(workflowFileStr);

      // 1. Upload the User Image to server
      const uniqueUserId = Date.now().toString();
      const userBlob = new Blob([userImageFile.buffer], { type: userImageFile.mimetype });
      const uploadedUserFileName = await uploadImageToComfyUI(userBlob, `user_${uniqueUserId}.png`);

      // 2. Fetch the Garment Image from the URL and Upload to server
      const garRes = await fetch(garmentImageStr);
      if (!garRes.ok) throw new Error("Failed to fetch garment image from catalog URL.");
      const garBlob = await garRes.blob();
      const uploadedGarmentFileName = await uploadImageToComfyUI(garBlob, `garment_${uniqueUserId}.jpg`);

      // 3. Inject parameters into the ComfyUI Workflow JSON
      // Node 14: Load Human Image
      workflowObj["14"].inputs.image = uploadedUserFileName;

      // Node 15: Load Garment Image
      workflowObj["15"].inputs.image = uploadedGarmentFileName;

      // Node 29: GroundingDinoSAMSegment (Dynamic Masking Prompt)
      workflowObj["29"].inputs.prompt = garmentPrompt;

      // Node 35: IDM-VTON Params (Ensuring prompt matches expected clothing)
      workflowObj["35"].inputs.garment_description = `a ${garmentPrompt}`;

      // 4. Submit the Workflow
      console.log("[IDM-VTON] Submitting workflow to ComfyUI...");
      const promptId = await submitComfyUIWorkflow(workflowObj);

      // 5. Poll for completion
      console.log(`[IDM-VTON] Workflow queued with ID ${promptId}. Polling for completion...`);
      const historyData = await pollComfyUIForHistory(promptId);

      // 6. Extract the generated image URL (Node 21 in our deploy1.json configuration)
      const outputs = historyData.outputs;

      if (outputs && outputs["21"] && outputs["21"].images && outputs["21"].images.length > 0) {
        const generatedImg = outputs["21"].images[0];
        const finalUrl = getComfyUIImageURL(generatedImg.filename, generatedImg.type, generatedImg.subfolder);

        console.log(`[IDM-VTON] Generation complete! URL: ${finalUrl}`);

        return res.json({
          success: true,
          resultUrl: finalUrl
        });
      } else {
        throw new Error("Generation completed but no output image was found in the history.");
      }

    } catch (error: any) {
      console.error('[IDM-VTON] API Route Error:', error.message || error);
      return res.status(500).json({ success: false, error: error.message || 'Internal server error' });
    }
  });

  // API Routes
  app.get("/api/products", async (req: any, res: any, next: any) => {
    try {
      const { data: products, error } = await supabase.from('products').select('*');
      if (error) throw error;

      const formattedProducts = (products || []).map(p => ({
        ...p,
        sizeChart: p.size_chart ? JSON.parse(p.size_chart) : undefined,
        is_available: p.is_available === 1
      }));
      res.json(formattedProducts);
    } catch (err: any) {
      next(err);
    }
  });

  app.get("/api/categories", async (req: any, res: any, next: any) => {
    try {
      const { data: categories, error } = await supabase.from('categories').select('*');
      if (error) throw error;
      res.json(categories || []);
    } catch (err: any) {
      next(err);
    }
  });

  app.post("/api/categories", async (req: any, res: any, next: any) => {
    try {
      const validatedData = CategorySchema.parse(req.body);
      const { id, name, slug, description, parentId, image } = validatedData;
      const { error } = await supabase.from('categories').insert([{ id, name, slug, description, parentid: parentId, image }]);
      if (error) throw error;
      res.json({ success: true });
    } catch (err: any) {
      next(err);
    }
  });

  app.put("/api/categories/:id", async (req: any, res: any, next: any) => {
    try {
      const { id } = req.params;
      const validatedData = CategorySchema.parse(req.body);
      const { name, slug, description, parentId, image } = validatedData;
      const { error } = await supabase.from('categories').update({ name, slug, description, parentid: parentId, image }).eq('id', id);
      if (error) throw error;
      res.json({ success: true });
    } catch (err: any) {
      next(err);
    }
  });

  app.delete("/api/categories/:id", async (req: any, res: any, next: any) => {
    try {
      const { id } = req.params;
      const { error } = await supabase.from('categories').delete().eq('id', id);
      if (error) throw error;
      res.json({ success: true });
    } catch (err: any) {
      next(err);
    }
  });

  app.post("/api/products", async (req: any, res: any, next: any) => {
    try {
      const validatedData = ProductSchema.parse(req.body);
      const { name, price, category, image, image2, image3, image4, image5, video, video2, description, is_available, sizeChart, gender, brand, occasion, season, fabric, type } = validatedData;
      const { data, error } = await supabase.from('products').insert([{
        name, price, category, image, image2: image2 || null, image3: image3 || null,
        image4: image4 || null, image5: image5 || null, video: video || null, video2: video2 || null,
        description, is_available: is_available === false ? 0 : 1, size_chart: sizeChart ? JSON.stringify(sizeChart) : null,
        gender: gender || null, brand: brand || null, occasion: occasion || null, season: season || null, fabric: fabric || null, type: type || null
      }]).select('id').single();

      if (error) throw error;
      
      // Background task: trigger AI to generate visual embedding
      if (data?.id && image) {
        fetch('http://127.0.0.1:8000/api/v1/embed-product', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ product_id: data.id, image_url: image })
        }).catch(err => console.error('[EMBEDDING TRIGGER ERROR]', err.message));
      }
      
      res.json({ success: true, id: data?.id });
    } catch (err: any) {
      next(err);
    }
  });

  app.put("/api/products/:id", async (req: any, res: any, next: any) => {
    try {
      const { id } = req.params;
      const validatedData = ProductSchema.parse(req.body);
      const { name, price, category, image, image2, image3, image4, image5, video, video2, description, is_available, sizeChart, gender, brand, occasion, season, fabric, type } = validatedData;
      const { error } = await supabase.from('products').update({
        name, price, category, image, image2: image2 || null, image3: image3 || null,
        image4: image4 || null, image5: image5 || null, video: video || null, video2: video2 || null,
        description, is_available: is_available === false ? 0 : 1, size_chart: sizeChart ? JSON.stringify(sizeChart) : null,
        gender: gender || null, brand: brand || null, occasion: occasion || null, season: season || null, fabric: fabric || null, type: type || null
      }).eq('id', id);

      if (error) throw error;
      
      // Background task: trigger AI to update visual embedding
      if (image) {
        fetch('http://127.0.0.1:8000/api/v1/embed-product', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ product_id: parseInt(id), image_url: image })
        }).catch(err => console.error('[EMBEDDING TRIGGER ERROR]', err.message));
      }
      
      res.json({ success: true });
    } catch (err: any) {
      next(err);
    }
  });

  app.delete("/api/products/:id", async (req: any, res: any, next: any) => {
    try {
      const { id } = req.params;
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
      res.json({ success: true });
    } catch (err: any) {
      next(err);
    }
  });

  // Services Endpoints
  app.get("/api/services", async (req: any, res: any, next: any) => {
    try {
      const { data, error } = await supabase.from('services').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      res.json(data || []);
    } catch (err: any) {
      next(err);
    }
  });

  app.post("/api/services", async (req: any, res: any, next: any) => {
    try {
      const validatedData = ServiceSchema.parse(req.body);
      const { error } = await supabase.from('services').insert([validatedData]);
      if (error) throw error;
      res.json({ success: true });
    } catch (err: any) {
      next(err);
    }
  });

  app.put("/api/services/:id", async (req: any, res: any, next: any) => {
    try {
      const { id } = req.params;
      const validatedData = ServiceSchema.parse(req.body);
      const { error } = await supabase.from('services').update(validatedData).eq('id', id);
      if (error) throw error;
      res.json({ success: true });
    } catch (err: any) {
      next(err);
    }
  });

  app.delete("/api/services/:id", async (req: any, res: any, next: any) => {
    try {
      const { id } = req.params;
      const { error } = await supabase.from('services').delete().eq('id', id);
      if (error) throw error;
      res.json({ success: true });
    } catch (err: any) {
      next(err);
    }
  });

  // Contact Endpoints
  app.get("/api/contact", async (req: any, res: any, next: any) => {
    try {
      const { data, error } = await supabase.from('contact_messages').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      res.json(data || []);
    } catch (err: any) {
      next(err);
    }
  });

  app.post("/api/contact", async (req: any, res: any, next: any) => {
    try {
      const validatedData = ContactSchema.parse(req.body);
      const { error } = await supabase.from('contact_messages').insert([validatedData]);
      if (error) throw error;
      res.json({ success: true });
    } catch (err: any) {
      next(err);
    }
  });

  app.put("/api/contact/:id", async (req: any, res: any, next: any) => {
    try {
      const { id } = req.params;
      const { error } = await supabase.from('contact_messages').update({ is_read: req.body.is_read }).eq('id', id);
      if (error) throw error;
      res.json({ success: true });
    } catch (err: any) {
      next(err);
    }
  });

  app.delete("/api/contact/:id", async (req: any, res: any, next: any) => {
    try {
      const { id } = req.params;
      const { error } = await supabase.from('contact_messages').delete().eq('id', id);
      if (error) throw error;
      res.json({ success: true });
    } catch (err: any) {
      next(err);
    }
  });

  app.get("/api/orders", async (req: any, res: any, next: any) => {
    try {
      const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      res.json(data || []);
    } catch (err: any) {
      next(err);
    }
  });

  app.post("/api/orders", async (req: any, res: any, next: any) => {
    try {
      const validatedData = OrderSchema.parse(req.body);
      const { email, total, items } = validatedData;

      // Mocking Secure Payment Processing on Backend
      console.log(`[PAYMENT] Processing mock payment for ${email} of amount $${total}`);
      await new Promise(resolve => setTimeout(resolve, 800)); // Simulate delay
      
      const paymentSuccess = true;
      if (!paymentSuccess) {
         throw new Error("Payment declined by Mock Gateway.");
      }

      const { data, error } = await supabase.from('orders').insert([{
        customer_email: email, total, items: JSON.stringify(items)
      }]).select('id').single();

      if (error) throw error;
      res.json({ success: true, orderId: data?.id, paymentStatus: 'Success' });
    } catch (err: any) {
      next(err);
    }
  });

  // Newsletter Endpoints
  app.get("/api/newsletters", async (req: any, res: any, next: any) => {
    try {
      const { data, error } = await supabase.from('newsletters').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      res.json(data || []);
    } catch (err: any) {
      next(err);
    }
  });

  app.post("/api/newsletters", async (req: any, res: any, next: any) => {
    try {
      const { email } = req.body;
      const { error } = await supabase.from('newsletters').insert([{ email, status: 'Active' }]);
      if (error) throw error;
      res.json({ success: true });
    } catch (err: any) {
      next(err);
    }
  });

  // Banners Endpoints
  app.get("/api/banners", async (req: any, res: any, next: any) => {
    try {
      const { data, error } = await supabase.from('banners').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      res.json(data || []);
    } catch (err: any) {
      next(err);
    }
  });

  // --- NEW DASHBOARD ENDPOINTS ---
  const createSimpleGetRoute = (path: string, table: string) => {
    app.get(path, async (req: any, res: any, next: any) => {
      try {
        const { data, error } = await supabase.from(table).select('*').order('created_at', { ascending: false });
        if (error) throw error;
        res.json(data || []);
      } catch (err: any) {
        next(err);
      }
    });
  };

  createSimpleGetRoute("/api/reviews", "reviews");
  createSimpleGetRoute("/api/discounts", "discounts");
  createSimpleGetRoute("/api/tags", "tags");
  createSimpleGetRoute("/api/blog_posts", "blog_posts");
  createSimpleGetRoute("/api/audit_logs", "audit_logs");
  createSimpleGetRoute("/api/transactions", "transactions");
  createSimpleGetRoute("/api/media", "media");

  // --- AUTH & PROFILES ENDPOINTS ---
  // Using bcrypt for password hashing

  app.post("/api/auth/signup", async (req: any, res: any, next: any) => {
    try {
      const validatedData = AuthSchema.parse(req.body);
      const password_hash = await bcrypt.hash(validatedData.password, 10);
      
      const { data, error } = await supabase.from('profiles').insert([{ 
        email: validatedData.email, 
        password_hash,
        name: validatedData.name || validatedData.email.split('@')[0],
        role: 'user'
      }]).select('*').single();

      if (error) throw error;
      res.json({ success: true, user: { id: data.id, email: data.email, name: data.name, role: data.role } });
    } catch (err: any) {
      next(err);
    }
  });

  app.post("/api/auth/login", async (req: any, res: any, next: any) => {
    try {
      const { email, password } = req.body;
      
      const { data, error } = await supabase.from('profiles')
        .select('*')
        .eq('email', email)
        .single();

      let isMatch = false;
      if (data) {
        isMatch = await bcrypt.compare(password, data.password_hash);
      }

      if (error || !data || !isMatch) {
         // Special fallback for hardcoded admin if not in DB yet
         const adminEmail = process.env.VITE_ADMIN_EMAIL || 'admin@zelori.com';
         const adminPassword = process.env.VITE_ADMIN_PASSWORD;
         
         if (adminPassword && email === adminEmail && password === adminPassword) {
           return res.json({ success: true, user: { id: 'admin-1', email, name: 'Admin', role: 'admin' } });
         }
         return res.status(401).json({ success: false, error: 'Invalid credentials' });
      }
      
      res.json({ success: true, user: { id: data.id, email: data.email, name: data.name, role: data.role } });
    } catch (err: any) {
      next(err);
    }
  });

  app.get("/api/profiles", async (req: any, res: any, next: any) => {
    try {
      const { data, error } = await supabase.from('profiles').select('id, email, name, role, phone, address, avatar_url, created_at').order('created_at', { ascending: false });
      if (error) throw error;
      res.json(data);
    } catch (err: any) {
      next(err);
    }
  });

  app.get("/api/profiles/:id", async (req: any, res: any, next: any) => {
    try {
      const { data, error } = await supabase.from('profiles').select('id, email, name, role, phone, address, avatar_url, created_at').eq('id', req.params.id).single();
      if (error) throw error;
      res.json(data);
    } catch (err: any) {
      next(err);
    }
  });

  app.put("/api/profiles/:id", async (req: any, res: any, next: any) => {
    try {
      const validatedData = ProfileSchema.parse(req.body);
      const { error } = await supabase.from('profiles').update(validatedData).eq('id', req.params.id);
      if (error) throw error;
      res.json({ success: true });
    } catch (err: any) {
      next(err);
    }
  });

  // --- AI CHAT HISTORY ENDPOINTS ---
  app.get("/api/chat/sessions/:userId", async (req: any, res: any, next: any) => {
    try {
      const { data, error } = await supabase.from('chat_sessions').select('*').eq('user_id', req.params.userId).order('updated_at', { ascending: false });
      if (error) throw error;
      res.json(data || []);
    } catch (err: any) {
      next(err);
    }
  });

  app.get("/api/chat/messages/:sessionId", async (req: any, res: any, next: any) => {
    try {
      const { data, error } = await supabase.from('chat_messages').select('*').eq('session_id', req.params.sessionId).order('created_at', { ascending: true });
      if (error) throw error;
      res.json(data || []);
    } catch (err: any) {
      next(err);
    }
  });

  app.post("/api/chat/wrapper", async (req: any, res: any, next: any) => {
    try {
      const { userId, sessionId, user_message, chat_history } = req.body;
      
      let currentSessionId = sessionId;
      
      // 1. If user is logged in but no session, create one
      if (userId && !currentSessionId) {
        const { data: newSession, error: sessionErr } = await supabase.from('chat_sessions').insert([{
           user_id: userId,
           title: user_message.substring(0, 30) + '...'
        }]).select('id').single();
        if (!sessionErr && newSession) {
           currentSessionId = newSession.id;
        }
      }

      // 2. Save User Message
      if (currentSessionId) {
         await supabase.from('chat_messages').insert([{
           session_id: currentSessionId,
           role: 'user',
           content: user_message
         }]);
      }

      // 3. Call AI Assistant Python Backend directly via fetch
      const aiRes = await fetch('http://127.0.0.1:8000/api/v1/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_message, chat_history: chat_history || [] })
      });
      
      if (!aiRes.ok) {
        throw new Error("AI Assistant failed to respond");
      }
      const aiData = await aiRes.json();
      
      // 4. Save AI Response
      if (currentSessionId && aiData.reply) {
         await supabase.from('chat_messages').insert([{
           session_id: currentSessionId,
           role: 'assistant',
           content: aiData.reply,
           recommendations: aiData.recommendations ? JSON.stringify(aiData.recommendations) : null
         }]);
      }

      // 5. Return to frontend
      res.json({
        sessionId: currentSessionId,
        reply: aiData.reply,
        recommendations: aiData.recommendations
      });
    } catch (err: any) {
      next(err);
    }
  });

  // Global Error Handler Middleware
  app.use((err: any, req: any, res: any, next: any) => {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: 'Validation failed', details: err.issues });
    }
    
    console.error('[SERVER ERROR]', err);
    res.status(500).json({ success: false, error: err.message || 'Internal Server Error' });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
