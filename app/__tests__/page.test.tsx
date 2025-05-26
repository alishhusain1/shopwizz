import { render, screen } from '@testing-library/react';
import Home from '../page';

// Mock next/navigation for useRouter
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() })
}));

// Mock AuthContext and hooks
jest.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({ user: null, loading: false })
}));
jest.mock('../../hooks/useAuthModal', () => ({
  useAuthModal: () => ({ isOpen: false, mode: 'login', openModal: jest.fn(), closeModal: jest.fn(), changeMode: jest.fn() })
}));
jest.mock('../../hooks/useEmailVerification', () => ({
  useEmailVerification: () => ({ needsVerification: false })
}));

// Mock Header and other components using require('react').createElement
jest.mock('../../components/Header', () => () => require('react').createElement('div', { 'data-testid': 'header' }));
jest.mock('../../components/SearchResultsLayout', () => () => require('react').createElement('div', { 'data-testid': 'search-results-layout' }));
jest.mock('../../components/AuthModals', () => () => require('react').createElement('div', { 'data-testid': 'auth-modals' }));
jest.mock('../../components/EmailVerificationBanner', () => () => require('react').createElement('div', { 'data-testid': 'email-verification-banner' }));

describe('Landing Page', () => {
  it('renders the hero section and CTA', () => {
    render(<Home />);
    expect(screen.getByTestId('header')).toBeInTheDocument();
    expect(screen.getByText(/let's go shopping!/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign up free/i })).toBeInTheDocument();
  });

  it('shows the search bar', () => {
    render(<Home />);
    expect(screen.getByPlaceholderText(/search/i)).toBeInTheDocument();
  });

  // Add more tests for image upload, voice input, etc. as needed
}); 