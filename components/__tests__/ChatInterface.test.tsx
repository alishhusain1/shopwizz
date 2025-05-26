import { render, screen, fireEvent } from '@testing-library/react';
import ChatInterface from '../ChatInterface';

// Mock AuthModals to avoid AuthProvider context errors
jest.mock('../AuthModals', () => () => null);

describe('ChatInterface', () => {
  const baseProps = {
    messages: [],
    onSendMessage: jest.fn(),
    onNewSearch: jest.fn(),
    isFullScreen: true,
  };

  it('renders example queries when there are no messages', () => {
    render(<ChatInterface {...baseProps} />);
    expect(screen.getByText(/what can i help you find today/i)).toBeInTheDocument();
    expect(screen.getByText(/find me a comfortable office chair under \$200/i)).toBeInTheDocument();
  });

  it('renders messages when provided', () => {
    const messages = [
      { id: '1', type: 'user' as const, content: 'Hello', timestamp: new Date() },
      { id: '2', type: 'ai' as const, content: 'Hi! How can I help?', timestamp: new Date() },
    ];
    render(<ChatInterface {...baseProps} messages={messages} />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
    expect(screen.getByText('Hi! How can I help?')).toBeInTheDocument();
  });

  it('renders input area with textarea, image, mic, and send button', () => {
    render(<ChatInterface {...baseProps} />);
    expect(screen.getByPlaceholderText(/ask anything about products/i)).toBeInTheDocument();
    expect(screen.getByTitle(/upload images/i)).toBeInTheDocument();
    expect(screen.getByTitle(/voice recording/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /send/i })).toBeInTheDocument();
  });

  it('calls onSendMessage when sending a message', () => {
    const onSendMessage = jest.fn();
    render(<ChatInterface {...baseProps} onSendMessage={onSendMessage} />);
    const textarea = screen.getByPlaceholderText(/ask anything about products/i);
    fireEvent.change(textarea, { target: { value: 'Test message' } });
    fireEvent.keyPress(textarea, { key: 'Enter', code: 'Enter', charCode: 13 });
    expect(onSendMessage).toHaveBeenCalledWith('Test message');
  });

  it('calls onSendMessage when clicking a suggested query', () => {
    const onSendMessage = jest.fn();
    render(<ChatInterface {...baseProps} onSendMessage={onSendMessage} messages={[]} />);
    const button = screen.getByText(/find me a comfortable office chair under \$200/i);
    fireEvent.click(button);
    expect(onSendMessage).toHaveBeenCalledWith('Find me a comfortable office chair under $200');
  });
}); 