'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { analyzeTransactions } from '@/ai/flows/transaction-insights';
import type { AnalyzeTransactionsOutput } from '@/ai/flows/transaction-insights';
import { getTransactionsSync } from '@/lib/data-loader';
import type { Transaction } from '@/data/types';
import { Sparkles, Loader2, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function SmartAdvicePage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [recommendations, setRecommendations] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setTransactions(getTransactionsSync());
  }, []);

  const handleGetAdvice = async () => {
    if (transactions.length === 0) {
      setError("No transaction data available to analyze.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setRecommendations(null);

    try {
      const input = { transactions: JSON.stringify(transactions) };
      const result: AnalyzeTransactionsOutput = await analyzeTransactions(input);
      setRecommendations(result.recommendations);
    } catch (err) {
      console.error("Error getting advice:", err);
      setError("Failed to get financial advice. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-accent" />
          Smart Financial Advice
        </CardTitle>
        <CardDescription>
          Get personalized saving and budgeting recommendations based on your transaction history.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {recommendations && (
          <div className="mb-4 p-4 border rounded-md bg-secondary/50">
            <h3 className="font-semibold mb-2 text-lg">Your Personalized Recommendations:</h3>
            <Textarea
              readOnly
              value={recommendations}
              className="min-h-[150px] bg-background"
              aria-label="Financial recommendations"
            />
          </div>
        )}

        {!recommendations && !isLoading && (
           <p className="text-muted-foreground">Click the button below to analyze your transactions and receive tailored advice.</p>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={handleGetAdvice} disabled={isLoading} className="w-full sm:w-auto">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Get My Advice
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
