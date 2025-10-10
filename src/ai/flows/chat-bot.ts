'use server';
/**
 * @fileOverview A simple chatbot that can hold a conversation.
 *
 * - chatBot - A function that handles the chat conversation.
 * - ChatBotInput - The input type for the chatBot function.
 * - ChatBotOutput - The return type for the chatBot function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ChatBotInputSchema = z.object({
  history: z.array(z.object({
    role: z.enum(['user', 'model']),
    content: z.string(),
  })).describe('The conversation history.'),
});
export type ChatBotInput = z.infer<typeof ChatBotInputSchema>;

const ChatBotOutputSchema = z.object({
    response: z.string().describe('The chatbot\'s response.'),
});
export type ChatBotOutput = z.infer<typeof ChatBotOutputSchema>;

export async function chatBot(input: ChatBotInput): Promise<ChatBotOutput> {
  return chatBotFlow(input);
}

const prompt = ai.definePrompt({
  name: 'chatBotPrompt',
  input: {
    schema: ChatBotInputSchema,
  },
  output: {
    schema: ChatBotOutputSchema,
  },
  prompt: `You are a friendly and helpful AI assistant designed for a random chat application. A user has been matched with you because no human partner was available. Your goal is to be engaging, interesting, and keep the conversation going.

Here is the conversation history:
{{#each history}}
{{#if (eq role 'user')}}User: {{content}}\n{{/if}}
{{#if (eq role 'model')}}You: {{content}}\n{{/if}}
{{/each}}

Based on the history, provide a suitable response. Be creative and ask questions to encourage the user to continue chatting.`,
});

const chatBotFlow = ai.defineFlow(
  {
    name: 'chatBotFlow',
    inputSchema: ChatBotInputSchema,
    outputSchema: ChatBotOutputSchema,
  },
  async input => {
    const llmResponse = await ai.generate({
        prompt: prompt.render(input)!,
        model: 'googleai/gemini-2.5-flash',
        config: {
            // Lower temperature for more predictable, friendly responses
            temperature: 0.5,
        }
    });

    const output = llmResponse.output();
    if (!output) {
      return { response: "Sorry, I'm having a little trouble thinking right now. Could you say that again?" };
    }
    // Assuming the raw output might be a JSON string, we parse it.
    // If not, we just use the text.
    try {
      const parsed = JSON.parse(output as string);
      return { response: parsed.response || "I'm not sure what to say." };
    } catch(e) {
      // If parsing fails, it's likely just a string response
      return { response: output as string };
    }
  }
);
