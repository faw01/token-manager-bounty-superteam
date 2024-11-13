'use client';

import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { useEffect, useState } from 'react';
import { getAccount, getAssociatedTokenAddress, getMint } from '@solana/spl-token';
import { PublicKey } from '@solana/web3.js';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';

interface TokenInfo {
  mint: string;
  symbol: string;
  balance: number;
  decimals: number;
}

export function TokenList() {
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const [tokens, setTokens] = useState<TokenInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchTokens() {
      if (!publicKey) return;

      try {
        setIsLoading(true);
        const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
          publicKey,
          { programId: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA') }
        );

        const tokenInfoPromises = tokenAccounts.value.map(async (account) => {
          const mintAddress = account.account.data.parsed.info.mint;
          const mint = await getMint(connection, new PublicKey(mintAddress));
          
          return {
            mint: mintAddress,
            symbol: account.account.data.parsed.info.tokenAmount.symbol || 'Unknown',
            balance: Number(account.account.data.parsed.info.tokenAmount.amount) / Math.pow(10, mint.decimals),
            decimals: mint.decimals,
          };
        });

        const tokenInfos = await Promise.all(tokenInfoPromises);
        setTokens(tokenInfos);
      } catch (error) {
        console.error('Error fetching tokens:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchTokens();
  }, [connection, publicKey]);

  if (!publicKey) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-[125px] w-full" />
        <Skeleton className="h-[125px] w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Your Tokens</h2>
      {tokens.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground">No tokens found</p>
          </CardContent>
        </Card>
      ) : (
        tokens.map((token) => (
          <Link key={token.mint} href={`/tokens/${token.mint}`}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{token.symbol}</span>
                  <span className="text-lg">{token.balance.toLocaleString()}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground break-all">
                  Mint: {token.mint}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))
      )}
    </div>
  );
}