'use client';

import { useState } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { 
  getAssociatedTokenAddress,
  TOKEN_PROGRAM_ID,
  TOKEN_2022_PROGRAM_ID,
  createInitializeMintInstruction,
  createAssociatedTokenAccountInstruction,
  createMintToInstruction,
} from '@solana/spl-token';
import { 
  Keypair, 
  SystemProgram, 
  Transaction,
  PublicKey,
} from '@solana/web3.js';

interface CreateTokenParams {
  name: string;
  symbol: string;
  decimals: number;
  initialSupply: number;
  standard: 'token' | 'token-2022';
}

export function useTokenCreation() {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const [isCreating, setIsCreating] = useState(false);

  async function createToken({
    name,
    symbol,
    decimals,
    initialSupply,
    standard,
  }: CreateTokenParams) {
    if (!publicKey || !sendTransaction) {
      throw new Error('Wallet not connected');
    }

    setIsCreating(true);

    try {
      // Generate a new keypair for the mint account
      const mintKeypair = Keypair.generate();
      const programId = standard === 'token' ? TOKEN_PROGRAM_ID : TOKEN_2022_PROGRAM_ID;

      // Calculate the rent-exempt reserve
      const lamports = await connection.getMinimumBalanceForRentExemption(82);

      // Get the associated token account address
      const associatedTokenAddress = await getAssociatedTokenAddress(
        mintKeypair.publicKey,
        publicKey,
        false,
        programId
      );

      // Create the mint and token account in one transaction
      const transaction = new Transaction().add(
        // Create the mint account
        SystemProgram.createAccount({
          fromPubkey: publicKey,
          newAccountPubkey: mintKeypair.publicKey,
          space: 82,
          lamports,
          programId,
        }),
        // Initialize the mint
        createInitializeMintInstruction(
          mintKeypair.publicKey,
          decimals,
          publicKey,
          publicKey,
          programId
        ),
        // Create the associated token account
        createAssociatedTokenAccountInstruction(
          publicKey,
          associatedTokenAddress,
          publicKey,
          mintKeypair.publicKey,
          programId
        )
      );

      // Send and confirm the first transaction
      const signature = await sendTransaction(transaction, connection, {
        signers: [mintKeypair],
      });
      await connection.confirmTransaction(signature);

      // Create mint to instruction
      const mintTx = new Transaction().add(
        createMintToInstruction(
          mintKeypair.publicKey,
          associatedTokenAddress,
          publicKey,
          initialSupply * (10 ** decimals),
          [],
          programId
        )
      );

      // Send mint transaction
      const mintSig = await sendTransaction(mintTx, connection);
      await connection.confirmTransaction(mintSig);

      return {
        mint: mintKeypair.publicKey.toBase58(),
        tokenAccount: associatedTokenAddress.toBase58(),
      };
    } catch (error) {
      console.error('Token creation error:', error);
      throw error;
    } finally {
      setIsCreating(false);
    }
  }

  return {
    createToken,
    isCreating,
  };
}