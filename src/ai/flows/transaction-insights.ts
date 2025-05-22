// 'use server'
'use server';

/**
 * @fileOverview This file contains the Genkit flow for providing transaction insights.
 *
 * - analyzeTransactions - Analyzes user transactions and provides personalized recommendations.
 * - AnalyzeTransactionsInput - The input type for the analyzeTransactions function.
 * - AnalyzeTransactionsOutput - The output type for the analyzeTransactions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeTransactionsInputSchema = z.object({
  transactions: z.string().describe('A JSON string of the user transactions.'),
});
export type AnalyzeTransactionsInput = z.infer<typeof AnalyzeTransactionsInputSchema>;

const AnalyzeTransactionsOutputSchema = z.object({
  recommendations: z
    .string()
    .describe(
      'Personalized recommendations for saving and budgeting based on the transaction history.'
    ),
});
export type AnalyzeTransactionsOutput = z.infer<typeof AnalyzeTransactionsOutputSchema>;

export async function analyzeTransactions(input: AnalyzeTransactionsInput): Promise<AnalyzeTransactionsOutput> {
  return analyzeTransactionsFlow(input);
}

const analyzeTransactionsPrompt = ai.definePrompt({
  name: 'analyzeTransactionsPrompt',
  input: {schema: AnalyzeTransactionsInputSchema},
  output: {schema: AnalyzeTransactionsOutputSchema},
  prompt: `You are a personal finance advisor. Analyze the following transactions and provide personalized recommendations for saving and budgeting. Be concise. Do not mention that you are an AI. Do not include any introductory or concluding remarks.

Transactions: {{{transactions}}}`,
});

const analyzeTransactionsFlow = ai.defineFlow(
  {
    name: 'analyzeTransactionsFlow',
    inputSchema: AnalyzeTransactionsInputSchema,
    outputSchema: AnalyzeTransactionsOutputSchema,
  },
  async input => {
    const {output} = await analyzeTransactionsPrompt(input);
    return output!;
  }
);
