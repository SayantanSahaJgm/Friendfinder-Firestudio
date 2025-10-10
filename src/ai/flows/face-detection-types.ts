'use server';

import { z } from 'genkit';

export const DetectFaceInputSchema = z.object({
  photoDataUri: z.string().describe("A photo of a user, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."),
});
export type DetectFaceInput = z.infer<typeof DetectFaceInputSchema>;


export const FaceDetectionOutputSchema = z.object({
  faceDetected: z.boolean().describe('Whether or not a face was detected in the input image.'),
  reason: z.string().optional().describe('If faceDetected is false, a brief reason why.'),
});
export type FaceDetectionOutput = z.infer<typeof FaceDetectionOutputSchema>;
