'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { useWallet } from '@solana/wallet-adapter-react';
import { useTokenCreation } from '@/hooks/use-token-creation';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

const tokenFormSchema = z.object({
  name: z.string().min(1, 'Token name is required'),
  symbol: z.string().min(1, 'Token symbol is required').max(10, 'Symbol must be 10 characters or less'),
  decimals: z.coerce.number().min(0).max(9),
  initialSupply: z.coerce.number().positive('Initial supply must be greater than 0'),
  standard: z.enum(['token', 'token-2022']),
});

type TokenFormValues = z.infer<typeof tokenFormSchema>;

const defaultValues: Partial<TokenFormValues> = {
  decimals: 9,
  standard: 'token',
};

export function TokenCreationForm() {
  const { connected } = useWallet();
  const { toast } = useToast();
  const { createToken, isCreating } = useTokenCreation();

  const form = useForm<TokenFormValues>({
    resolver: zodResolver(tokenFormSchema),
    defaultValues,
  });

  if (!connected) {
    return (
      <div className="text-center py-6">
        <p className="text-muted-foreground">Please connect your wallet to create tokens</p>
      </div>
    );
  }

  async function onSubmit(data: TokenFormValues) {
    try {
      toast({
        title: 'Creating token...',
        description: 'Please approve the transaction in your wallet.',
      });
      
      console.log('Submitting form with data:', data);
      
      const result = await createToken({
        name: data.name,
        symbol: data.symbol,
        decimals: data.decimals,
        initialSupply: data.initialSupply,
        standard: data.standard,
      });
      
      console.log('Token created successfully:', result);
      
      toast({
        title: 'Success!',
        description: `Token ${data.symbol} created successfully! Mint address: ${result.mint}`,
      });
    } catch (error) {
      console.error('Detailed error in form submission:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error instanceof Error 
          ? `Error: ${error.message}` 
          : 'Failed to create token. Please try again.',
      });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="standard"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Token Standard</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a token standard" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="token">Token Program</SelectItem>
                  <SelectItem value="token-2022">Token-2022 Program</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                Choose between the original Token Program or the new Token-2022 Program
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Token Name</FormLabel>
              <FormControl>
                <Input placeholder="My Token" {...field} />
              </FormControl>
              <FormDescription>
                The name of your token
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="symbol"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Token Symbol</FormLabel>
              <FormControl>
                <Input placeholder="TKN" {...field} />
              </FormControl>
              <FormDescription>
                A short identifier for your token (max 10 characters)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="decimals"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Decimals</FormLabel>
              <FormControl>
                <Input type="number" min="0" max="9" {...field} />
              </FormControl>
              <FormDescription>
                Number of decimal places (0-9, typically 9 for most tokens)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="initialSupply"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Initial Supply</FormLabel>
              <FormControl>
                <Input type="number" min="1" {...field} />
              </FormControl>
              <FormDescription>
                The initial amount of tokens to mint
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isCreating}>
          {isCreating ? 'Creating Token...' : 'Create Token'}
        </Button>
      </form>
    </Form>
  );
}