import { render, screen, fireEvent, act } from '@testing-library/react';
import FilterSidebar from '../FilterSidebar';

// Mock dependencies
jest.mock('@/lib/auth', () => ({
  getCurrentUser: jest.fn().mockResolvedValue(null),
  updateUserPreferences: jest.fn().mockResolvedValue(undefined),
}));

describe('FilterSidebar', () => {
  const baseProps = {
    filters: {},
    onFiltersChange: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders collapsed sidebar by default and expands on button click', async () => {
    await act(async () => {
      render(<FilterSidebar {...baseProps} />);
    });
    // Should not show sidebar label initially (sidebar is collapsed)
    expect(screen.queryByText((content, element) => element?.tagName === 'SPAN' && /filters/i.test(content))).not.toBeInTheDocument();
    // Expand sidebar
    fireEvent.click(screen.getByRole('button'));
    expect(screen.getAllByText(/filters/i).some(el => el.tagName === 'SPAN')).toBe(true);
  });

  it('expands and collapses the Price Range section', async () => {
    await act(async () => {
      render(<FilterSidebar {...baseProps} />);
    });
    fireEvent.click(screen.getByRole('button'));
    const priceButton = screen.getByText(/price range/i).closest('button');
    fireEvent.click(priceButton!);
    expect(screen.getByPlaceholderText(/min \$/i)).toBeInTheDocument();
    fireEvent.click(priceButton!);
    expect(screen.queryByPlaceholderText(/min \$/i)).not.toBeInTheDocument();
  });

  it('updates price min/max and calls onFiltersChange', async () => {
    const onFiltersChange = jest.fn();
    await act(async () => {
      render(<FilterSidebar {...baseProps} onFiltersChange={onFiltersChange} />);
    });
    fireEvent.click(screen.getByRole('button'));
    fireEvent.click(screen.getByText(/price range/i).closest('button')!);
    const minInput = screen.getByPlaceholderText(/min \$/i);
    fireEvent.change(minInput, { target: { value: '10' } });
    expect(onFiltersChange).toHaveBeenCalledWith(expect.objectContaining({ priceMin: 10 }));
    const maxInput = screen.getByPlaceholderText(/max \$/i);
    fireEvent.change(maxInput, { target: { value: '100' } });
    expect(onFiltersChange).toHaveBeenCalledWith(expect.objectContaining({ priceMax: 100 }));
  });

  it('uses slider and preset buttons for price', async () => {
    const onFiltersChange = jest.fn();
    await act(async () => {
      render(<FilterSidebar {...baseProps} onFiltersChange={onFiltersChange} />);
    });
    fireEvent.click(screen.getByRole('button'));
    fireEvent.click(screen.getByText(/price range/i).closest('button')!);
    const slider = screen.getByRole('slider');
    fireEvent.change(slider, { target: { value: '50' } });
    expect(onFiltersChange).toHaveBeenCalledWith(expect.objectContaining({ priceMax: 50 }));
    // Click a preset
    fireEvent.click(screen.getByText(/under \$10/i));
    // Check that both priceMin and priceMax were set in separate calls
    expect(onFiltersChange).toHaveBeenCalledWith(expect.objectContaining({ priceMin: 0 }));
    expect(onFiltersChange).toHaveBeenCalledWith(expect.objectContaining({ priceMax: 10 }));
  });

  it('expands and updates rating filter', async () => {
    const onFiltersChange = jest.fn();
    await act(async () => {
      render(<FilterSidebar {...baseProps} onFiltersChange={onFiltersChange} />);
    });
    fireEvent.click(screen.getByRole('button'));
    fireEvent.click(screen.getByText(/customer rating/i).closest('button')!);
    fireEvent.click(screen.getByText(/4\+ stars/i));
    expect(onFiltersChange).toHaveBeenCalledWith(expect.objectContaining({ minRating: 4 }));
  });

  it('calls onFiltersChange with empty object when clearing filters', async () => {
    const onFiltersChange = jest.fn();
    await act(async () => {
      render(<FilterSidebar {...baseProps} onFiltersChange={onFiltersChange} />);
    });
    fireEvent.click(screen.getByRole('button'));
    fireEvent.click(screen.getByText(/clear/i));
    expect(onFiltersChange).toHaveBeenCalledWith({});
  });
}); 