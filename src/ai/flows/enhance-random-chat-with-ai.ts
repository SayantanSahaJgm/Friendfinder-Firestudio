'use server';
/**
 * @fileOverview Analyzes user profiles to make decisions for random chat connections.
 * 
 * - enhanceRandomChat - A function that decides on ICE candidates for privacy.
 * - EnhanceRandomChatInput - Input type for the function.
 * - EnhanceRandomChatOutput - Output type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const EnhanceRandomChatInputSchema = z.object({
    currentUserProfile: z.string().describe("The profile description of the current user."),
    otherUserProfile: z.string().describe("The profile description of the potential chat partner."),
});
export type EnhanceRandomChatInput = z.infer<typeof EnhanceRandomChatInputSchema>;

const EnhanceRandomChatOutputSchema = z.object({
    iceCandidateDecision: z.string().describe("A brief, user-facing explanation of the AI's decision regarding connection privacy (e.g., 'Filtering potentially sensitive location data for your privacy.')."),
});
export type EnhanceRandomChatOutput = z.infer<typeof EnhanceRandomChatOutputSchema>;

export async function enhanceRandomChat(input: EnhanceRandomChatInput): Promise<EnhanceRandomChatOutput> {
    return enhanceRandomChatFlow(input);
}

const prompt = ai.definePrompt({
    name: 'enhanceRandomChatPrompt',
    input: { schema: EnhanceRandomChatInputSchema },
    output: { schema: EnhanceRandomChatOutputSchema },
    prompt: `You are a privacy and safety moderator for a chat application. 
             Given two user profiles, decide if any information should be filtered from the WebRTC ICE candidates to protect user privacy (like IP addresses).
             
             User 1: {{{currentUserProfile}}}
             User 2: {{{otherUserProfile}}}

             Your goal is to provide a brief, friendly message to the user about the privacy action being taken.
             Example: "To protect your privacy, we're ensuring your exact location isn't shared."
             Example: "Running a quick safety check on the connection."

             Generate a decision message.`,
});


const enhanceRandomChatFlow = ai.defineFlow(
  {
    name: 'enhanceRandomChatFlow',
    inputSchema: EnhanceRandomChatInputSchema,
    outputSchema: EnhanceRandomChatOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
