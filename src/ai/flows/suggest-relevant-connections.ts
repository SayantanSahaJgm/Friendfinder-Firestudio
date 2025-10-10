'use server';

/**
 * @fileOverview Suggests relevant connections to a user based on shared interests.
 *
 * - suggestRelevantConnections - A function that suggests relevant connections.
 * - SuggestRelevantConnectionsInput - The input type for the suggestRelevantConnections function.
 * - SuggestRelevantConnectionsOutput - The return type for the suggestRelevantConnections function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestRelevantConnectionsInputSchema = z.object({
  userProfile: z.object({
    interests: z
      .array(z.string())
      .describe('The interests of the current user.'),
    pastConnections: z
      .array(z.string())
      .optional()
      .describe('Usernames of past connections.'),
  }),
  potentialConnections: z.array(
    z.object({
      username: z.string().describe('Username of the potential connection.'),
      interests: z.array(z.string()).describe('Interests of the potential connection.'),
    })
  ),
});
export type SuggestRelevantConnectionsInput = z.infer<
  typeof SuggestRelevantConnectionsInputSchema
>;

const SuggestRelevantConnectionsOutputSchema = z.object({
  suggestedConnections: z
    .array(z.string())
    .describe('A list of usernames to suggest to the user.'),
});
export type SuggestRelevantConnectionsOutput = z.infer<
  typeof SuggestRelevantConnectionsOutputSchema
>;

export async function suggestRelevantConnections(
  input: SuggestRelevantConnectionsInput
): Promise<SuggestRelevantConnectionsOutput> {
  return suggestRelevantConnectionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestRelevantConnectionsPrompt',
  input: {
    schema: SuggestRelevantConnectionsInputSchema,
  },
  output: {
    schema: SuggestRelevantConnectionsOutputSchema,
  },
  prompt: `You are a social networking expert. Your job is to suggest relevant connections between users, so that they can discover new friends with similar passions.

You are provided with the current user's profile, their interests, and a list of potential connections.

Profile:
{{#each userProfile.interests}} - {{this}}\n{{/each}}

Potential connections:
{{#each potentialConnections}}
  - Username: {{username}}, Interests: {{#each interests}}{{this}}{{#unless @last}}, {{/unless}}{{/each}}\n{{/each}}

Consider these factors when suggesting connections:

*  The number of shared interests between the current user and the potential connection.
*  Whether the current user has already connected with this person in the past (avoid suggesting past connections.)


Suggest a list of usernames to suggest to the user:

{{#each potentialConnections}}
Considering the user's interests: {{../userProfile.interests}}
and the potential connection's interests: {{interests}}
Should the app suggest {{username}} to the user? Respond 'yes' or 'no'.
{{/each}}

Based on the answers, create a list of usernames (only usernames).
`,
});

const suggestRelevantConnectionsFlow = ai.defineFlow(
  {
    name: 'suggestRelevantConnectionsFlow',
    inputSchema: SuggestRelevantConnectionsInputSchema,
    outputSchema: SuggestRelevantConnectionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    // Parse the output to extract the suggested connections
    const lines = output!.split('\n');
    const suggestedConnections: string[] = [];
    for (let i = 0; i < input.potentialConnections.length; i++) {
      // Check if the string includes 'yes', and the loop index is within the bounds of the split lines array.
      if (lines[i]?.toLowerCase().includes('yes')) {
        suggestedConnections.push(input.potentialConnections[i].username);
      }
    }

    return {suggestedConnections};
  }
);
