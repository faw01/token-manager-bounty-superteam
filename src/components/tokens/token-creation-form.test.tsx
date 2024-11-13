import { render, screen, fireEvent } from '@testing-library/react';
import { TokenCreationForm } from './token-creation-form';
import { useWallet } from '@solana/wallet-adapter-react';

// Mock the wallet hook
jest.mock('@solana/wallet-adapter-react', () => ({
  useWallet: jest.fn(),
}));

describe('TokenCreationForm', () => {
  beforeEach(() => {
    (useWallet as jest.Mock).mockReturnValue({
      connected: true,
      publicKey: '123',
    });
  });

  it('validates required fields', async () => {
    render(<TokenCreationForm />);
    
    fireEvent.click(screen.getByText('Create Token'));
    
    expect(await screen.findByText('Token name is required')).toBeInTheDocument();
    expect(await screen.findByText('Token symbol is required')).toBeInTheDocument();
  });

  // Add more tests...
});