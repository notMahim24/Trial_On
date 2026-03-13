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
import { z } from 'zod';
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
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.warn("⚠️ WARNING: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are missing from environment variables.");
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
  app.use(cors()); // Enable CORS for all origins (adjust in prod if needed)
  app.use(morgan('dev')); // Structured request logging
  app.use(express.json());

  // Rate Limiting (apply to all /api routes)
  const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
    message: { success: false, error: 'Too many requests from this IP, please try again after 15 minutes' },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  });
  app.use('/api/', apiLimiter);

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
    image: z.string().url('Must be a valid URL'),
    image2: z.string().url().optional().nullable(),
    image3: z.string().url().optional().nullable(),
    image4: z.string().url().optional().nullable(),
    image5: z.string().url().optional().nullable(),
    video: z.string().url().optional().nullable(),
    video2: z.string().url().optional().nullable(),
    description: z.string().optional().nullable(),
    is_available: z.boolean().default(true),
    sizeChart: z.record(z.string(), z.any()).optional().nullable(),
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
      const { name, price, category, image, image2, image3, image4, image5, video, video2, description, is_available, sizeChart } = validatedData;
      const { data, error } = await supabase.from('products').insert([{
        name, price, category, image, image2: image2 || null, image3: image3 || null,
        image4: image4 || null, image5: image5 || null, video: video || null, video2: video2 || null,
        description, is_available: is_available === false ? 0 : 1, size_chart: sizeChart ? JSON.stringify(sizeChart) : null
      }]).select('id').single();

      if (error) throw error;
      res.json({ success: true, id: data?.id });
    } catch (err: any) {
      next(err);
    }
  });

  app.put("/api/products/:id", async (req: any, res: any, next: any) => {
    try {
      const { id } = req.params;
      const validatedData = ProductSchema.parse(req.body);
      const { name, price, category, image, image2, image3, image4, image5, video, video2, description, is_available, sizeChart } = validatedData;
      const { error } = await supabase.from('products').update({
        name, price, category, image, image2: image2 || null, image3: image3 || null,
        image4: image4 || null, image5: image5 || null, video: video || null, video2: video2 || null,
        description, is_available: is_available === false ? 0 : 1, size_chart: sizeChart ? JSON.stringify(sizeChart) : null
      }).eq('id', id);

      if (error) throw error;
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
