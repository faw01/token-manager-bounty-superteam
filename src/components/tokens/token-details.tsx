'use client';

import { useEffect, useState } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { getMint, getAccount, TOKEN_PROGRAM_ID, TOKEN_2022_PROGRAM_ID } from '@solana/spl-token';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

interface TokenDetailsProps {
  mint: string;
}

interface TokenInfo {
  supply: number;
  decimals: number;
  authority: string | null;
  frozenAccounts: number;
}

export function TokenDetails({ mint }: TokenDetailsProps) {
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const { toast } = useToast();
  const [tokenInfo, setTokenInfo] = useState<TokenInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [transferAmount, setTransferAmount] = useState('');
  const [recipientAddress, setRecipientAddress] = useState('');

  useEffect(() => {
    async function fetchTokenInfo() {
      try {
        const mintInfo = await getMint(connection, new PublicKey(mint));
        
        setTokenInfo({
          supply: Number(mintInfo.supply),
          decimals: mintInfo.decimals,
          authority: mintInfo.mintAuthority?.toBase58() || null,
          frozenAccounts: 0, // You can implement this if needed
        });
      } catch (error) {
        console.error('Error fetching token info:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to fetch token information',
        });
      } finally {
        setIsLoading(false);
      }
    }

    fetchTokenInfo();
  }, [connection, mint, toast]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
      </div>
    );
  }

  if (!tokenInfo) {
    return <div>Token not found</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Total Supply:</span>
          <span>{tokenInfo.supply / Math.pow(10, tokenInfo.decimals)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Decimals:</span>
          <span>{tokenInfo.decimals}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Mint Authority:</span>
          <span className="text-sm truncate max-w-[200px]">
            {tokenInfo.authority || 'None'}
          </span>
        </div>
      </div>

      <div className="border-t pt-6">
        <h3 className="text-lg font-medium mb-4">Transfer Tokens</h3>
        <div className="space-y-4">
          <div>
            <Input
              placeholder="Recipient address"
              value={recipientAddress}
              onChange={(e) => setRecipientAddress(e.target.value)}
            />
          </div>
          <div>
            <Input
              type="number"
              placeholder="Amount"
              value={transferAmount}
              onChange={(e) => setTransferAmount(e.target.value)}
            />
          </div>
          <Button className="w-full">
            Transfer
          </Button>
        </div>
      </div>
    </div>
  );
}