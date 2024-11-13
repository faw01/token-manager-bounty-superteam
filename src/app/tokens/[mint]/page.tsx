import { Suspense } from 'react';
import { TokenDetails } from '@/components/tokens/token-details';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface TokenPageProps {
  params: {
    mint: string;
  };
}

export default function TokenPage({ params }: TokenPageProps) {
  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Token Details</CardTitle>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<div>Loading token details...</div>}>
            <TokenDetails mint={params.mint} />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}