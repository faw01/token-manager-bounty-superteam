import '@/app/globals.css';
import { Inter } from 'next/font/google';
import { WalletProvider } from '@/components/providers/wallet-provider';
import { MainNav } from '@/components/main-nav';
import { Toaster } from '@/components/ui/toaster';

const inter = Inter({ subsets: ['latin'] });

interface RootLayoutProps {
  children: React.ReactNode;
}

export const metadata = {
  title: 'Solana Token Manager',
  description: 'Create and manage Solana tokens and NFTs',
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <WalletProvider>
          <div className="relative flex min-h-screen flex-col">
            <MainNav />
            <main className="flex-1 container py-8">
              {children}
            </main>
            <Toaster />
          </div>
        </WalletProvider>
      </body>
    </html>
  );
}