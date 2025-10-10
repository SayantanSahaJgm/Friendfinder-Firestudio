'use server';
/**
 * @fileOverview A flow for detecting a face in a photo.
 *
 * - detectFace - A function that detects if a face is present in a photo.
 * - DetectFaceInput - The input type for the detectFace function.
 * - FaceDetectionOutput - The return type for the detectFace function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { FaceDetectionOutputSchema, DetectFaceInputSchema } from './face-detection-types';
import type { FaceDetectionOutput, DetectFaceInput } from './face-detection-types';

export { type FaceDetectionOutput, type DetectFaceInput };


export async function detectFace(input: DetectFaceInput): Promise<FaceDetectionOutput> {
  return detectFaceFlow(input);
}

const prompt = ai.definePrompt({
  name: 'faceDetectionPrompt',
  input: { schema: DetectFaceInputSchema },
  output: { schema: FaceDetectionOutputSchema },
  prompt: `Analyze the provided image and determine if a human face is clearly visible.
The user is trying to verify for a video chat. The face should be reasonably centered and not obscured.

Image: {{media url=photoDataUri}}

- If a clear face is detected, set faceDetected to true.
- If no face is detected, or it's obscured, set faceDetected to false and provide a brief, helpful reason (e.g., "No face found in the image," or "Face is too blurry," or "Please center your face in the photo.").
`,
});

const detectFaceFlow = ai.defineFlow(
  {
    name: 'detectFaceFlow',
    inputSchema: DetectFaceInputSchema,
    outputSchema: FaceDetectionOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
