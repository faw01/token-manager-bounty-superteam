import { DashboardHero } from '@/components/dashboard/hero';
import { Suspense } from 'react';
import { TokenList } from '@/components/tokens/token-list';
import { Card, CardContent } from '@/components/ui/card';

export default function Home() {
  return (
    <div className="space-y-8">
      <Suspense fallback={<div>Loading...</div>}>
        <DashboardHero />
      </Suspense>

      <Suspense fallback={<div>Loading tokens...</div>}>
        <TokenList />
      </Suspense>
      <Card>
        <CardContent className="pt-6">
          <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
          <p className="text-muted-foreground">
            Your recent token and NFT activities will appear here
          </p>
        </CardContent>
      </Card>
    </div>
  );
}