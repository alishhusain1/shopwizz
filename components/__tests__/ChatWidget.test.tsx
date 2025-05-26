import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ChatWidget from '../ChatWidget';

if (!global.crypto) {
  global.crypto = {} as Crypto;
}
(global.crypto as any).randomUUID = () => '123e4567-e89b-12d3-a456-426614174000';

jest.mock('@/lib/api', () => ({
  callChatGPT: jest.fn().mockResolvedValue({
    choices: [
      { message: { content: 'Hello! How can I assist you today?' } }
    ]
  })
}));

describe('ChatWidget', () => {
  it('sends a user message and receives an AI response (desktop)', async () => {
    render(<ChatWidget onSearch={jest.fn()} isLoading={false} isMobile={false} />);
    const input = screen.getByPlaceholderText(/type or talk/i);
    fireEvent.change(input, { target: { value: 'Hi there' } });
    fireEvent.keyPress(input, { key: 'Enter', code: 'Enter', charCode: 13 });
    await waitFor(() => {
      expect(screen.getByText((content) => content.includes('Hi there'))).toBeInTheDocument();
      expect(screen.getByText((content) => content.includes('How can I assist you today?'))).toBeInTheDocument();
    });
  });

  it('sends a user message and receives an AI response (mobile)', async () => {
    render(<ChatWidget onSearch={jest.fn()} isLoading={false} isMobile={true} />);
    // No need to expand for messages, just like desktop
    const input = screen.getByPlaceholderText(/type or talk/i);
    fireEvent.change(input, { target: { value: 'Hi there' } });
    fireEvent.keyPress(input, { key: 'Enter', code: 'Enter', charCode: 13 });
    await waitFor(() => {
      expect(screen.getByText((content) => content.includes('Hi there'))).toBeInTheDocument();
      expect(screen.getByText((content) => content.includes('How can I assist you today?'))).toBeInTheDocument();
    });
  });
}); 