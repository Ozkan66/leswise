import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ToolsDashboard from '../ToolsDashboard';

// Mock Next.js router
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Mock Next.js Link
jest.mock('next/link', () => {
  const MockedLink = ({ children, href, ...props }: { children: React.ReactNode; href: string; [key: string]: unknown }) => (
    <a href={href} {...props}>
      {children}
    </a>
  );
  MockedLink.displayName = 'MockedLink';
  return MockedLink;
});

describe('ToolsDashboard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the main heading and description', () => {
    render(<ToolsDashboard />);
    
    expect(screen.getByText('Leswise Productiviteitstools')).toBeInTheDocument();
    expect(screen.getByText(/Ontdek krachtige tools om je onderwijsmateriaal te maken/i)).toBeInTheDocument();
  });

  it('renders the worksheet generator tool card', () => {
    render(<ToolsDashboard />);
    
    expect(screen.getByText('Leswise Worksheet Generator')).toBeInTheDocument();
    expect(screen.getByText(/Maak interactieve werkbladen met AI-ondersteuning/i)).toBeInTheDocument();
    expect(screen.getByText('📝')).toBeInTheDocument();
  });

  it('has a functional search input', async () => {
    render(<ToolsDashboard />);
    
    const searchInput = screen.getByPlaceholderText('Zoek tools...');
    expect(searchInput).toBeInTheDocument();
    
    fireEvent.change(searchInput, { target: { value: 'worksheet' } });
    
    await waitFor(() => {
      expect(screen.getByText('Leswise Worksheet Generator')).toBeInTheDocument();
    });
  });

  it('filters tools based on search term', async () => {
    render(<ToolsDashboard />);
    
    const searchInput = screen.getByPlaceholderText('Zoek tools...');
    
    // Search for something that doesn't exist
    fireEvent.change(searchInput, { target: { value: 'nonexistent' } });
    
    await waitFor(() => {
      expect(screen.getByText('Geen tools gevonden die overeenkomen met je zoekopdracht.')).toBeInTheDocument();
    });
  });

  it('shows "coming soon" section when no search term', () => {
    render(<ToolsDashboard />);
    
    expect(screen.getByText('Meer tools komen eraan!')).toBeInTheDocument();
    expect(screen.getByText(/We werken hard aan nieuwe productiviteitstools/i)).toBeInTheDocument();
  });

  it('has a start tool button that links to worksheets', () => {
    render(<ToolsDashboard />);
    
    const startButton = screen.getByText('Start Tool');
    expect(startButton).toBeInTheDocument();
    
    const toolCard = startButton.closest('a');
    expect(toolCard).toHaveAttribute('href', '/worksheets');
  });

  it('has a feedback link', () => {
    render(<ToolsDashboard />);
    
    const feedbackLink = screen.getByText('Feedback geven');
    expect(feedbackLink).toBeInTheDocument();
    expect(feedbackLink.closest('a')).toHaveAttribute('href', '/profile');
  });

  it('renders the tools grid section', () => {
    render(<ToolsDashboard />);
    
    // Check that the main tool is rendered
    expect(screen.getByText('Leswise Worksheet Generator')).toBeInTheDocument();
    expect(screen.getByText('Start Tool')).toBeInTheDocument();
  });

  it('clears search and shows all tools', async () => {
    render(<ToolsDashboard />);
    
    const searchInput = screen.getByPlaceholderText('Zoek tools...');
    
    // First search for something
    fireEvent.change(searchInput, { target: { value: 'nonexistent' } });
    
    await waitFor(() => {
      expect(screen.getByText('Geen tools gevonden die overeenkomen met je zoekopdracht.')).toBeInTheDocument();
    });
    
    // Clear search
    fireEvent.change(searchInput, { target: { value: '' } });
    
    await waitFor(() => {
      expect(screen.getByText('Leswise Worksheet Generator')).toBeInTheDocument();
    });
  });
});