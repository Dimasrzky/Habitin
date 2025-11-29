import { ENV_CONFIG } from './env.config';

const VISION_API_ENDPOINT = 'https://vision.googleapis.com/v1/images:annotate';

interface VisionAPIRequest {
  requests: {
    image: {
      content: string; // base64 string (without data:image prefix)
    };
    features: {
      type: string;
      maxResults?: number;
    }[];
  }[];
}

interface VisionAPIResponse {
  responses: {
    textAnnotations?: {
      description: string;
      boundingPoly?: any;
    }[];
    fullTextAnnotation?: {
      text: string;
    };
    error?: {
      code: number;
      message: string;
    };
  }[];
}

/**
 * Analyze image with Google Vision API
 * @param base64Image - Base64 encoded image string (WITHOUT data:image prefix)
 */
export const analyzeImageWithVisionAPI = async (
  base64Image: string
): Promise<VisionAPIResponse> => {
  try {
    console.log('🔍 Starting OCR process...');
    console.log('📏 Base64 length:', base64Image.length);

    const apiKey = ENV_CONFIG.googleVision.apiKey;
    if (!apiKey) {
      throw new Error('Google Vision API key not found in environment variables');
    }

    // ✅ CRITICAL: Remove data URI prefix if present
    let cleanBase64 = base64Image;
    if (base64Image.startsWith('data:')) {
      cleanBase64 = base64Image.split(',')[1];
      console.log('🧹 Removed data URI prefix, new length:', cleanBase64.length);
    }

    const requestBody: VisionAPIRequest = {
      requests: [
        {
          image: {
            content: cleanBase64, // ✅ Clean base64 string only
          },
          features: [
            {
              type: 'TEXT_DETECTION',
              maxResults: 1,
            },
          ],
        },
      ],
    };

    console.log('🔍 Sending request to Google Vision API...');

    const response = await fetch(`${VISION_API_ENDPOINT}?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Vision API Error Response:', errorData);
      throw new Error(`Vision API request failed: ${response.status}`);
    }

    const data: VisionAPIResponse = await response.json();

    // Check for API-level errors
    if (data.responses?.[0]?.error) {
      const apiError = data.responses[0].error;
      console.error('Vision API returned error:', apiError);
      throw new Error(`Vision API error: ${apiError.message}`);
    }

    console.log('✅ Vision API response received');
    
    return data;
  } catch (error: any) {
    console.error('❌ Vision API Error:', error);
    throw error;
  }
};