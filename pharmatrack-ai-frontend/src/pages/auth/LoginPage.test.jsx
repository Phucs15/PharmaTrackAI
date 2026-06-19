import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import LoginPage from './LoginPage';
import * as authHook from '@/hooks/useAuth';

vi.mock('@/hooks/useAuth');
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal();
  return { ...actual, useNavigate: () => vi.fn(), useLocation: () => ({ state: null }) };
});

function renderLoginPage() {
  return render(
    <MemoryRouter>
      <LoginPage />
    </MemoryRouter>
  );
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('LoginPage', () => {
  it('renders email and password inputs', () => {
    authHook.useAuth.mockReturnValue({ login: vi.fn() });
    renderLoginPage();
    expect(screen.getByLabelText(/corporate email/i)).toBeInTheDocument();
    expect(screen.getByLabelText('Password', { selector: 'input' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('calls login with entered credentials on submit', async () => {
    const mockLogin = vi.fn().mockResolvedValue({ id: '1', role: 'Administrator' });
    authHook.useAuth.mockReturnValue({ login: mockLogin });

    renderLoginPage();

    await userEvent.type(screen.getByLabelText(/corporate email/i), 'admin@pharmatrack.com');
    await userEvent.type(screen.getByLabelText('Password', { selector: 'input' }), 'admin123');
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('admin@pharmatrack.com', 'admin123');
    });
  });

  it('shows an error message when login fails', async () => {
    const mockLogin = vi.fn().mockRejectedValue({ message: 'Invalid email or password.' });
    authHook.useAuth.mockReturnValue({ login: mockLogin });

    renderLoginPage();

    await userEvent.type(screen.getByLabelText(/corporate email/i), 'bad@example.com');
    await userEvent.type(screen.getByLabelText('Password', { selector: 'input' }), 'wrongpass');
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByText(/invalid email or password/i)).toBeInTheDocument();
    });
  });

  it('disables the submit button while loading', async () => {
    let resolve;
    const mockLogin = vi.fn(() => new Promise((r) => { resolve = r; }));
    authHook.useAuth.mockReturnValue({ login: mockLogin });

    renderLoginPage();

    await userEvent.type(screen.getByLabelText(/corporate email/i), 'admin@pharmatrack.com');
    await userEvent.type(screen.getByLabelText('Password', { selector: 'input' }), 'admin123');
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }));

    expect(screen.getByRole('button', { name: /signing in/i })).toBeDisabled();

    resolve({});
  });

  it('toggles password visibility', async () => {
    authHook.useAuth.mockReturnValue({ login: vi.fn() });
    renderLoginPage();

    const input = screen.getByLabelText('Password', { selector: 'input' });
    expect(input).toHaveAttribute('type', 'password');

    await userEvent.click(screen.getByRole('button', { name: /show password/i }));
    expect(input).toHaveAttribute('type', 'text');

    await userEvent.click(screen.getByRole('button', { name: /hide password/i }));
    expect(input).toHaveAttribute('type', 'password');
  });
});
