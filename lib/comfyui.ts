// src/lib/comfyui.ts

// Read from environment variables to prevent hardcoding IPs in source control
const COMFYUI_API_URL = process.env.COMFYUI_API_URL || "http://localhost:8188";

export async function uploadImageToComfyUI(imageRaw: Blob | File, filename: string): Promise<string> {
  const formData = new FormData();
  formData.append("image", imageRaw, filename);
  
  const uploadResponse = await fetch(`${COMFYUI_API_URL}/upload/image`, {
    method: "POST",
    body: formData,
  });

  if (!uploadResponse.ok) {
    const text = await uploadResponse.text();
    throw new Error(`Failed to upload image to ComfyUI: ${uploadResponse.status} ${text}`);
  }

  const result = await uploadResponse.json();
  // ComfyUI returns { name, subfolder, type } on successful upload
  return result.name; 
}

export async function submitComfyUIWorkflow(workflowJson: any): Promise<string> {
  const response = await fetch(`${COMFYUI_API_URL}/prompt`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ prompt: workflowJson }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to submit workflow to ComfyUI: ${response.status} ${text}`);
  }

  const result = await response.json();
  return result.prompt_id;
}

export async function pollComfyUIForHistory(promptId: string, maxAttempts = 60, delayMs = 2000): Promise<any> {
    for (let attempts = 0; attempts < maxAttempts; attempts++) {
      const response = await fetch(`${COMFYUI_API_URL}/history/${promptId}`);
      
      if (response.ok) {
        const historyData = await response.json();
        if (historyData[promptId]) {
            return historyData[promptId];
        }
      }
      
      // Wait before checking again
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
    
    throw new Error("ComfyUI generation timed out.");
}

export function getComfyUIImageURL(filename: string, type: string = "output", subfolder: string = ""): string {
    const params = new URLSearchParams();
    params.append("filename", filename);
    params.append("type", type);
    if (subfolder) {
        params.append("subfolder", subfolder);
    }
    
    return `${COMFYUI_API_URL}/view?${params.toString()}`;
}
