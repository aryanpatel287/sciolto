import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { useSelector } from 'react-redux';
import Navbar from './Navbar';

// Mock react-redux hooks
vi.mock('react-redux', () => ({
  useSelector: vi.fn(),
  useDispatch: vi.fn(() => vi.fn()),
}));

// Mock useCart hook to isolate Navbar tests
vi.mock('../../cart/hooks/useCart', () => ({
  useCart: () => ({
    handleFetchCartCount: vi.fn(),
  }),
}));

// Mock LogoutButton to isolate Navbar tests
vi.mock('../../auth/components/LogoutButton', () => ({
  default: ({ onClick, className }) => (
    <button onClick={onClick} className={className} data-testid="logout-button">
      Logout
    </button>
  ),
}));

describe('Navbar Component', () => {
  let mockState;

  beforeEach(() => {
    vi.clearAllMocks();
    mockState = {
      auth: { user: null },
      cart: { cartCount: 0, items: [] }
    };
    useSelector.mockImplementation((selectorFn) => selectorFn(mockState));
  });

  it('should render the logo brand name "Sciolto"', () => {
    mockState.auth.user = null;

    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    );

    const logoElements = screen.getAllByText('Sciolto');
    expect(logoElements.length).toBeGreaterThan(0);
    expect(logoElements[0].closest('a')).toHaveAttribute('href', '/');
  });

  it('should open and close the Side Drawer category menu when toggled', () => {
    mockState.auth.user = null;

    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    );

    // Verify drawer starts closed (home item is queryable only in drawer header)
    expect(screen.queryByText('CATEGORIES')).not.toBeInTheDocument();

    // Trigger hamburger button to open drawer
    const hamburger = screen.getByLabelText('Open categories menu');
    fireEvent.click(hamburger);

    // Verify drawer is now open
    expect(screen.getByText('CATEGORIES')).toBeInTheDocument();
    expect(screen.getByText('FLAT 60% OFF')).toBeInTheDocument();
    expect(screen.getByText('CLOTHING CATEGORIES')).toBeInTheDocument();

    // Click Close button
    const closeBtn = screen.getByLabelText('Close categories menu');
    fireEvent.click(closeBtn);

    // Verify drawer is closed
    expect(screen.queryByText('CATEGORIES')).not.toBeInTheDocument();
  });

  it('should display username and profile dropdown triggers when user is authenticated', () => {
    mockState.auth.user = {
      fullname: 'Alex Editorial',
      role: 'buyer',
    };

    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    );

    // Should display User's first name
    const profileTrigger = screen.getByText('Alex');
    expect(profileTrigger).toBeInTheDocument();

    // Dropdown should be hidden initially
    expect(screen.queryByText('Profile')).not.toBeInTheDocument();

    // Click profile trigger to toggle dropdown
    fireEvent.click(profileTrigger);

    // Dropdown should now be visible
    expect(screen.getByText('Profile')).toBeInTheDocument();
    expect(screen.getByTestId('logout-button')).toBeInTheDocument();
  });

  it('should toggle mobile search overlay and submit search', () => {
    mockState.auth.user = null;
    
    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    );

    // Mobile search toggle button should be visible (queried by aria-label)
    const searchToggle = screen.getByLabelText('Open search bar');
    expect(searchToggle).toBeInTheDocument();

    // Click to open search takeover
    fireEvent.click(searchToggle);

    // Search input should now be visible and auto-focused
    const searchInput = screen.getByPlaceholderText('Search "STRAIGHT FIT JEANS"');
    expect(searchInput).toBeInTheDocument();

    // Click back button to close
    const closeSearch = screen.getByLabelText('Close search bar');
    fireEvent.click(closeSearch);

    // Mobile search takeover should be closed
    expect(screen.queryByLabelText('Close search bar')).not.toBeInTheDocument();
  });
});
