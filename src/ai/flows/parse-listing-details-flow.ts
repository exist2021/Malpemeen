
'use server';
/**
 * @fileOverview A flow to parse natural language into structured fish listing details.
 *
 * - parseListingDetails - A function that handles parsing the text.
 * - ParseListingDetailsInput - The input type for the parseListingDetails function.
 * - ParseListingDetailsOutput - The return type for the parseListingDetails function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ParseListingDetailsInputSchema = z.string().describe("The natural language text from the user about the fish listing.");

export type ParseListingDetailsInput = z.infer<typeof ParseListingDetailsInputSchema>;

const ParseListingDetailsOutputSchema = z.object({
  productName: z.string().optional().describe("The name of the fish product."),
  pricePerKg: z.number().optional().describe("The selling price per Kg."),
  portDetails: z.string().optional().describe("Details about the port of origin."),
  howCaught: z.string().optional().describe("Method used to catch the fish."),
  boatDetails: z.enum(["Ashok Leyland", "Persian Boat"]).optional().describe("Type of boat used."),
  owner: z.string().optional().describe("Owner of the boat/catch."),
  description: z.string().optional().describe("A general description of the fish, its size, quality, etc."),
});

export type ParseListingDetailsOutput = z.infer<typeof ParseListingDetailsOutputSchema>;

export async function parseListingDetails(input: ParseListingDetailsInput): Promise<ParseListingDetailsOutput> {
  return parseListingDetailsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'parseListingDetailsPrompt',
  input: { schema: ParseListingDetailsInputSchema },
  output: { schema: ParseListingDetailsOutputSchema },
  prompt: `You are an expert at parsing structured data from natural language. The user will provide text about a fish listing. Extract the relevant details and map them to the output schema.

You need to identify keywords to map the speech to the correct field. Here are some examples:
- "Product name is Fresh Tuna" -> productName: "Fresh Tuna"
- "Set price to 5000" -> pricePerKg: 5000
- "The port is Malpe" -> portDetails: "Malpe"
- "How it was caught is net fishing" -> howCaught: "net fishing"
- "Boat is Persian Boat" -> boatDetails: "Persian Boat"
- "Owner is John Doe" -> owner: "John Doe"
- "Description is This is a high-quality fresh fish, caught this morning." -> description: "This is a high-quality fresh fish, caught this morning."

If a field is not mentioned, do not include it in the output. If multiple fields are mentioned, extract all of them. The user might provide a full sentence or just a phrase.

User input: {{{input}}}`,
});

const parseListingDetailsFlow = ai.defineFlow(
  {
    name: 'parseListingDetailsFlow',
    inputSchema: ParseListingDetailsInputSchema,
    outputSchema: ParseListingDetailsOutputSchema,
  },
  async (input) => {
    if (!input.trim()) {
        return {};
    }
    const { output } = await prompt(input);
    return output!;
  }
);
