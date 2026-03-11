import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import multer from 'multer';
import * as fs from 'fs';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
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

  app.use(express.json());

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
  app.get("/api/products", async (req: any, res: any) => {
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
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/categories", async (req: any, res: any) => {
    try {
      const { data: categories, error } = await supabase.from('categories').select('*');
      if (error) throw error;
      res.json(categories || []);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/categories", async (req: any, res: any) => {
    try {
      const { id, name, slug, description, parentId, image } = req.body;
      const { error } = await supabase.from('categories').insert([{ id, name, slug, description, parentid: parentId, image }]);
      if (error) throw error;
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.put("/api/categories/:id", async (req: any, res: any) => {
    try {
      const { id } = req.params;
      const { name, slug, description, parentId, image } = req.body;
      const { error } = await supabase.from('categories').update({ name, slug, description, parentid: parentId, image }).eq('id', id);
      if (error) throw error;
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.delete("/api/categories/:id", async (req: any, res: any) => {
    try {
      const { id } = req.params;
      const { error } = await supabase.from('categories').delete().eq('id', id);
      if (error) throw error;
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/products", async (req: any, res: any) => {
    try {
      const { name, price, category, image, image2, image3, image4, image5, video, video2, description, is_available, sizeChart } = req.body;
      const { data, error } = await supabase.from('products').insert([{
        name, price, category, image, image2: image2 || null, image3: image3 || null,
        image4: image4 || null, image5: image5 || null, video: video || null, video2: video2 || null,
        description, is_available: is_available === false ? 0 : 1, size_chart: sizeChart ? JSON.stringify(sizeChart) : null
      }]).select('id').single();

      if (error) throw error;
      res.json({ success: true, id: data?.id });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.put("/api/products/:id", async (req: any, res: any) => {
    try {
      const { id } = req.params;
      const { name, price, category, image, image2, image3, image4, image5, video, video2, description, is_available, sizeChart } = req.body;
      const { error } = await supabase.from('products').update({
        name, price, category, image, image2: image2 || null, image3: image3 || null,
        image4: image4 || null, image5: image5 || null, video: video || null, video2: video2 || null,
        description, is_available: is_available === false ? 0 : 1, size_chart: sizeChart ? JSON.stringify(sizeChart) : null
      }).eq('id', id);

      if (error) throw error;
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.delete("/api/products/:id", async (req: any, res: any) => {
    try {
      const { id } = req.params;
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/orders", async (req: any, res: any) => {
    try {
      const { email, total, items } = req.body;
      const { data, error } = await supabase.from('orders').insert([{
        customer_email: email, total, items: JSON.stringify(items)
      }]).select('id').single();

      if (error) throw error;
      res.json({ success: true, orderId: data?.id });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
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
