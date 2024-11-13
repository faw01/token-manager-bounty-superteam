'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useWallet } from '@solana/wallet-adapter-react';
import { ArrowRight, Coins, Image } from 'lucide-react';
import Link from 'next/link';

export function QuickActions() {
  const { connected } = useWallet();

  if (!connected) return null;

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Coins className="h-5 w-5" />
            <span>Quick Token Creation</span>
          </CardTitle>
          <CardDescription>
            Create a new fungible token with default settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild className="w-full">
            <Link href="/tokens/create">
              Create Token <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Image className="h-5 w-5" />
            <span>Quick NFT Mint</span>
          </CardTitle>
          <CardDescription>
            Mint a new NFT with basic metadata
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild className="w-full">
            <Link href="/nfts/create">
              Mint NFT <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}