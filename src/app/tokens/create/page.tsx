import { Suspense } from 'react';
import { TokenCreationForm } from '@/components/tokens/token-creation-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function CreateTokenPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Create New Token</CardTitle>
          <CardDescription>
            Create a new fungible token using either the Token or Token-2022 standard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<div>Loading...</div>}>
            <TokenCreationForm />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}