'use client';

import { useState } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { 
  createMetadataAccountV3,
  CreateMetadataAccountV3InstructionAccounts,
  CreateMetadataAccountV3InstructionArgs,
} from '@metaplex-foundation/mpl-token-metadata';
import { 
  Metaplex,
  walletAdapterIdentity,
  CreateNftInput,
} from '@metaplex-foundation/js';
import { 
  Keypair,
  PublicKey,
  Transaction,
  SystemProgram,
  TransactionInstruction,
  Connection,
} from '@solana/web3.js';
import { 
  TOKEN_PROGRAM_ID,
  createInitializeMintInstruction,
  createAssociatedTokenAccountInstruction,
  getAssociatedTokenAddress,
  createMintToInstruction,
  MINT_SIZE,
} from '@solana/spl-token';

// Define the Token Metadata Program ID
const TOKEN_METADATA_PROGRAM_ID = new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s');

interface CreateNFTParams {
  name: string;
  symbol: string;
  description: string;
  imageUrl?: string;
  program: 'tokenMetadata' | 'core' | 'bubblegum';
}

interface NFTResponse {
  mint: string;
  metadata: string;
  tokenAccount?: string;
  signature: string;
}

export function useNFTCreation() {
  const { connection } = useConnection();
  const wallet = useWallet();
  const { publicKey, sendTransaction } = wallet;
  const [isCreating, setIsCreating] = useState(false);

  // Initialize Metaplex
  const metaplex = Metaplex.make(connection)
    .use(walletAdapterIdentity(wallet));

  async function createWithTokenMetadata({
    name,
    symbol,
    description,
    imageUrl,
  }: Omit<CreateNFTParams, 'program'>): Promise<NFTResponse> {
    if (!publicKey) throw new Error('Wallet not connected');

    try {
      console.log('Creating NFT with Token Metadata program...');
      
      // Generate a new keypair for the mint account
      const mintKeypair = Keypair.generate();
      console.log('Mint address:', mintKeypair.publicKey.toBase58());

      // Get the minimum lamports required for the mint
      const lamports = await connection.getMinimumBalanceForRentExemption(MINT_SIZE);
      
      // Get the associated token account address
      const associatedTokenAddress = await getAssociatedTokenAddress(
        mintKeypair.publicKey,
        publicKey
      );
      console.log('Associated token address:', associatedTokenAddress.toBase58());

      // Get metadata PDA
      const [metadataAddress] = PublicKey.findProgramAddressSync(
        [
          Buffer.from('metadata'),
          TOKEN_METADATA_PROGRAM_ID.toBuffer(),
          mintKeypair.publicKey.toBuffer(),
        ],
        TOKEN_METADATA_PROGRAM_ID
      );
      console.log('Metadata address:', metadataAddress.toBase58());

      // Create transaction
      const transaction = new Transaction();

      // Add mint account creation instruction
      transaction.add(
        SystemProgram.createAccount({
          fromPubkey: publicKey,
          newAccountPubkey: mintKeypair.publicKey,
          space: MINT_SIZE,
          lamports,
          programId: TOKEN_PROGRAM_ID,
        })
      );

      // Add mint initialization instruction
      transaction.add(
        createInitializeMintInstruction(
          mintKeypair.publicKey,
          0, // 0 decimals for NFT
          publicKey,
          publicKey,
          TOKEN_PROGRAM_ID
        )
      );

      // Create metadata instruction
      const accounts: CreateMetadataAccountV3InstructionAccounts = {
        metadata: metadataAddress,
        mint: mintKeypair.publicKey,
        mintAuthority: publicKey,
        payer: publicKey,
        updateAuthority: publicKey,
      };

      const args: CreateMetadataAccountV3InstructionArgs = {
        createMetadataAccountArgsV3: {
          data: {
            name,
            symbol,
            uri: imageUrl || '',
            sellerFeeBasisPoints: 0,
            creators: [{
              address: publicKey,
              verified: true,
              share: 100,
            }],
            collection: null,
            uses: null,
          },
          isMutable: true,
          collectionDetails: null,
        },
      };

      const metadataInstruction = createMetadataAccountV3(accounts, args);
      transaction.add(metadataInstruction);

      // Add token account creation instruction
      transaction.add(
        createAssociatedTokenAccountInstruction(
          publicKey,
          associatedTokenAddress,
          publicKey,
          mintKeypair.publicKey
        )
      );

      // Add mint instruction
      transaction.add(
        createMintToInstruction(
          mintKeypair.publicKey,
          associatedTokenAddress,
          publicKey,
          1,
          [],
          TOKEN_PROGRAM_ID
        )
      );

      console.log('Sending transaction...');
      const signature = await sendTransaction(transaction, connection, {
        signers: [mintKeypair],
      });
      
      console.log('Confirming transaction...');
      const confirmation = await connection.confirmTransaction(signature, 'confirmed');
      
      if (confirmation.value.err) {
        throw new Error(`Transaction failed: ${confirmation.value.err.toString()}`);
      }

      console.log('NFT created successfully!');
      return {
        mint: mintKeypair.publicKey.toBase58(),
        metadata: metadataAddress.toBase58(),
        tokenAccount: associatedTokenAddress.toBase58(),
        signature,
      };
    } catch (error) {
      console.error('Error creating NFT:', error);
      throw error;
    }
  }

  async function createWithCore({
    name,
    symbol,
    description,
    imageUrl,
  }: Omit<CreateNFTParams, 'program'>): Promise<NFTResponse> {
    if (!publicKey) throw new Error('Wallet not connected');

    try {
      console.log('Creating NFT with Metaplex Core...');
      
      const { response, nft } = await metaplex.nfts().create({
        name,
        symbol,
        sellerFeeBasisPoints: 0,
        uri: imageUrl || '',
        creators: [{
          address: publicKey,
          share: 100,
        }],
      });

      console.log('NFT created successfully!');
      return {
        mint: nft.address.toBase58(),
        metadata: nft.metadataAddress.toBase58(),
        signature: response.signature,
      };
    } catch (error) {
      console.error('Error creating NFT with Core:', error);
      throw error;
    }
  }

  async function createWithBubblegum({
    name,
    symbol,
    description,
    imageUrl,
  }: Omit<CreateNFTParams, 'program'>): Promise<NFTResponse> {
    if (!publicKey) throw new Error('Wallet not connected');
    
    try {
      throw new Error('Bubblegum implementation coming soon');
      
      // Placeholder return to satisfy TypeScript
      return {
        mint: '',
        metadata: '',
        signature: '',
      };
    } catch (error) {
      console.error('Error creating compressed NFT:', error);
      throw error;
    }
  }

  async function createNFT(params: CreateNFTParams): Promise<NFTResponse> {
    if (!publicKey || !sendTransaction) {
      throw new Error('Wallet not connected');
    }

    setIsCreating(true);

    try {
      switch (params.program) {
        case 'tokenMetadata':
          return await createWithTokenMetadata(params);
        
        case 'core':
          return await createWithCore(params);
        
        case 'bubblegum':
          return await createWithBubblegum(params);
        
        default:
          throw new Error('Invalid program selected');
      }
    } finally {
      setIsCreating(false);
    }
  }

  return {
    createNFT,
    isCreating,
  };
}