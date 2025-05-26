import { render, screen, fireEvent } from '@testing-library/react';
import ProductResults from '../ProductResults';

const mockProducts = [
  {
    asin: 'A1',
    title: 'Test Product 1',
    imageUrl: '/test1.jpg',
    price: 19.99,
    brand: 'BrandA',
    reviewCount: 100,
    avgRating: 4.3,
    affiliateUrl: 'https://amazon.com/dp/A1?tag=shopwizz-20',
    aiRating: 4.5,
    whyBuy: 'Great value',
  },
  {
    asin: 'A2',
    title: 'Test Product 2',
    imageUrl: '/test2.jpg',
    price: 29.99,
    brand: 'BrandB',
    reviewCount: 200,
    avgRating: 4.7,
    affiliateUrl: 'https://amazon.com/dp/A2?tag=shopwizz-20',
    aiRating: 4.8,
    whyBuy: 'Top rated',
  },
];

const baseProps = {
  products: mockProducts,
  searchQuery: 'shoes',
  isLoading: false,
  onProductClick: jest.fn(),
  chatMessages: [],
};

describe('ProductResults', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the correct number of product cards', () => {
    render(<ProductResults {...baseProps} />);
    expect(screen.getAllByRole('img').length).toBe(mockProducts.length);
    expect(screen.getAllByRole('button', { name: /buy/i }).length).toBe(mockProducts.length);
  });

  it('renders card content: image, title, rating, price, brand, and buy button', () => {
    render(<ProductResults {...baseProps} />);
    mockProducts.forEach((product) => {
      expect(screen.getByText(product.title)).toBeInTheDocument();
      expect(screen.getByText(product.brand)).toBeInTheDocument();
      expect(screen.getByText(`$${product.price.toFixed(2)}`)).toBeInTheDocument();
      expect(screen.getByText(product.avgRating.toFixed(1))).toBeInTheDocument();
      expect(screen.getByRole('img', { name: product.title })).toBeInTheDocument();
    });
    // Check all Buy buttons exist
    expect(screen.getAllByRole('button', { name: /buy/i }).length).toBe(mockProducts.length);
  });

  it('calls onProductClick when a card is clicked', () => {
    const onProductClick = jest.fn();
    render(<ProductResults {...baseProps} onProductClick={onProductClick} />);
    // Find the card by its title and click its parent card div
    const cardTitle = screen.getByText('Test Product 1');
    fireEvent.click(cardTitle.closest('.bg-gray-800') || cardTitle.parentElement!.parentElement!);
    expect(onProductClick).toHaveBeenCalledWith('A1');
  });

  it('opens affiliate URL in new tab when Buy button is clicked', () => {
    window.open = jest.fn();
    render(<ProductResults {...baseProps} />);
    const buyButtons = screen.getAllByRole('button', { name: /buy/i });
    fireEvent.click(buyButtons[0]);
    expect(window.open).toHaveBeenCalledWith('https://amazon.com/dp/A1?tag=shopwizz-20', '_blank');
  });

  it('renders AI message if present', () => {
    render(
      <ProductResults
        {...baseProps}
        chatMessages={[{ id: '1', type: 'ai', content: 'AI says hi', timestamp: new Date() }]}
      />
    );
    expect(screen.getByText('AI says hi')).toBeInTheDocument();
  });

  it('renders top selections analysis', () => {
    render(<ProductResults {...baseProps} />);
    expect(screen.getByText(/top selections/i)).toBeInTheDocument();
    expect(screen.getByText('Great value')).toBeInTheDocument();
    expect(screen.getByText('Top rated')).toBeInTheDocument();
  });
}); 