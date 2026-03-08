import { NextRequest, NextResponse } from 'next/server';
import { 
  uploadImageToComfyUI, 
  submitComfyUIWorkflow, 
  pollComfyUIForHistory, 
  getComfyUIImageURL 
} from '@/lib/comfyui';
import * as fs from 'fs';
import * as path from 'path';

// Load our target workflow
const workflowPath = path.join(process.cwd(), 'deploy1.json');

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const userImage = formData.get('userImage') as File;
    const garmentImageStr = formData.get('garmentImageUrl') as string;

    if (!userImage || !garmentImageStr) {
      return NextResponse.json({ success: false, error: 'Missing images' }, { status: 400 });
    }

    // Determine the garment type for dynamic masking
    // In a real app, this should come from a database associated with the product ID
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
    const uploadedUserFileName = await uploadImageToComfyUI(userImage, `user_${uniqueUserId}.png`);
    
    // 2. Fetch the Garment Image from the URL and Upload to server
    const garRes = await fetch(garmentImageStr);
    if(!garRes.ok) throw new Error("Failed to fetch garment image from catalog URL.");
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
      
      return NextResponse.json({ 
        success: true, 
        resultUrl: finalUrl
      });
    } else {
      throw new Error("Generation completed but no output image was found in the history.");
    }

  } catch (error: any) {
    console.error('[IDM-VTON] API Route Error:', error.message || error);
    return NextResponse.json({ success: false, error: error.message || 'Internal server error' }, { status: 500 });
  }
}
