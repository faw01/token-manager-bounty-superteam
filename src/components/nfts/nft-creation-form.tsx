'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { useWallet } from '@solana/wallet-adapter-react';
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

const nftFormSchema = z.object({
  name: z.string().min(1, 'NFT name is required'),
  symbol: z.string().min(1, 'Symbol is required').max(10, 'Symbol must be 10 characters or less'),
  description: z.string().min(1, 'Description is required'),
  program: z.enum(['tokenMetadata', 'core', 'bubblegum']),
  imageUrl: z.string().url('Must be a valid URL').optional(),
});

type NFTFormValues = z.infer<typeof nftFormSchema>;

const defaultValues: Partial<NFTFormValues> = {
  program: 'tokenMetadata',
};

export function NFTCreationForm() {
  const { connected } = useWallet();
  const { toast } = useToast();

  const form = useForm<NFTFormValues>({
    resolver: zodResolver(nftFormSchema),
    defaultValues,
  });

  if (!connected) {
    return (
      <div className="text-center py-6">
        <p className="text-muted-foreground">Please connect your wallet to create NFTs</p>
      </div>
    );
  }

  async function onSubmit(data: NFTFormValues) {
    try {
      toast({
        title: 'Creating NFT...',
        description: 'Please approve the transaction in your wallet.',
      });
      
      // TODO: Implement NFT creation logic
      console.log('Form data:', data);
      
      toast({
        title: 'Success!',
        description: 'NFT created successfully.',
      });
    } catch (error) {
      console.error('Error creating NFT:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to create NFT. Please try again.',
      });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="program"
          render={({ field }) => (
            <FormItem>
              <FormLabel>NFT Program</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an NFT program" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="tokenMetadata">Token Metadata Program</SelectItem>
                  <SelectItem value="core">Metaplex Core</SelectItem>
                  <SelectItem value="bubblegum">Bubblegum</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                Choose which Metaplex program to use for minting
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Add other form fields */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>NFT Name</FormLabel>
              <FormControl>
                <Input placeholder="My NFT" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="symbol"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Symbol</FormLabel>
              <FormControl>
                <Input placeholder="NFT" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Input placeholder="Describe your NFT" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="imageUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Image URL</FormLabel>
              <FormControl>
                <Input placeholder="https://..." {...field} />
              </FormControl>
              <FormDescription>
                URL to your NFT image
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full">
          Create NFT
        </Button>
      </form>
    </Form>
  );
}