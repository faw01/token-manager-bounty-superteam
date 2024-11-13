import { Suspense } from 'react';
import { NFTCreationForm } from '@/components/nfts/nft-creation-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function CreateNFTPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Create New NFT</CardTitle>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<div>Loading...</div>}>
            <NFTCreationForm />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}