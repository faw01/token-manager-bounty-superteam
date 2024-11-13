'use client';

import Link from 'next/link';
import { useWallet } from '@solana/wallet-adapter-react';
import { Coins, Image, FolderKanban } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface ActionCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  href: string;
}

function ActionCard({ icon, title, description, href }: ActionCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {icon}
          <span>{title}</span>
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Button asChild className="w-full">
          <Link href={href}>Get Started</Link>
        </Button>
      </CardContent>
    </Card>
  );
}

export function DashboardHero() {
  const { connected } = useWallet();

  if (!connected) {
    return (
      <div className="text-center py-12">
        <h1 className="text-4xl font-bold mb-4">Welcome to Token Manager</h1>
        <p className="text-muted-foreground mb-8">
          Connect your wallet to start creating and managing tokens on Solana
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <ActionCard
        icon={<Coins className="h-5 w-5" />}
        title="Create Token"
        description="Create fungible tokens using Token or Token-2022 standard"
        href="/tokens/create"
      />
      <ActionCard
        icon={<Image className="h-5 w-5" />}
        title="Create NFT"
        description="Mint NFTs using various Metaplex programs"
        href="/nfts/create"
      />
      <ActionCard
        icon={<FolderKanban className="h-5 w-5" />}
        title="Manage Collections"
        description="Create and manage your NFT collections"
        href="/collections"
      />
    </div>
  );
}