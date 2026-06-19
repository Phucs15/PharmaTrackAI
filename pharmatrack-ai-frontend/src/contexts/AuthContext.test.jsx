import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthProvider } from './AuthContext';
import { useAuth } from '@/hooks/useAuth';
import * as authService from '@/services/authService';

vi.mock('@/services/authService');

function TestConsumer() {
  const { user, isAuthenticated, isInitializing, login, logout, updateUser, hasRole } = useAuth();
  if (isInitializing) return <div data-testid="init">initializing</div>;
  return (
    <div>
      <div data-testid="user">{user ? user.name : 'none'}</div>
      <div data-testid="authenticated">{String(isAuthenticated)}</div>
      <div data-testid="has-admin">{String(hasRole('Administrator'))}</div>
      <button onClick={() => login('admin@pharmatrack.com', 'admin123')}>login</button>
      <button onClick={() => logout()}>logout</button>
      <button onClick={() => updateUser({ bio: 'new bio' })}>update</button>
    </div>
  );
}

function renderWithProvider() {
  return render(
    <AuthProvider>
      <TestConsumer />
    </AuthProvider>
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  authService.getCurrentUser.mockReturnValue(null);
  authService.logout.mockResolvedValue(undefined);
});

describe('AuthProvider', () => {
  it('starts unauthenticated when refresh token is absent/invalid', async () => {
    authService.getCurrentUser.mockReturnValue(null);
    authService.refreshToken.mockRejectedValue(new Error('No cookie'));

    renderWithProvider();

    // Wait past isInitializing
    await waitFor(() => expect(screen.queryByTestId('init')).toBeNull());
    expect(screen.getByTestId('authenticated').textContent).toBe('false');
    expect(screen.getByTestId('user').textContent).toBe('none');
  });

  it('restores the session when the refresh token cookie is valid', async () => {
    authService.refreshToken.mockResolvedValue({
      token: 'new-access-token',
      user: { id: 'user-1', name: 'Admin', role: 'Administrator' },
    });

    renderWithProvider();

    await waitFor(() => expect(screen.queryByTestId('init')).toBeNull());
    expect(screen.getByTestId('authenticated').textContent).toBe('true');
    expect(screen.getByTestId('user').textContent).toBe('Admin');
    expect(screen.getByTestId('has-admin').textContent).toBe('true');
  });

  it('falls back to localStorage user if refreshToken does not return a user', async () => {
    authService.getCurrentUser.mockReturnValue({ id: 'user-1', name: 'Cached User', role: 'Warehouse Staff' });
    authService.refreshToken.mockResolvedValue({ token: 'new-token', user: null });

    renderWithProvider();

    await waitFor(() => expect(screen.queryByTestId('init')).toBeNull());
    expect(screen.getByTestId('user').textContent).toBe('Cached User');
  });

  it('login sets the user returned by authService.login', async () => {
    authService.refreshToken.mockRejectedValue(new Error('No cookie'));
    authService.login.mockResolvedValue({
      user: { id: 'user-2', name: 'New User', role: 'Warehouse Staff' },
      token: 'tok',
    });

    renderWithProvider();
    await waitFor(() => expect(screen.queryByTestId('init')).toBeNull());

    await userEvent.click(screen.getByText('login'));

    await waitFor(() => expect(screen.getByTestId('user').textContent).toBe('New User'));
    expect(authService.login).toHaveBeenCalledWith('admin@pharmatrack.com', 'admin123');
  });

  it('logout clears the current user', async () => {
    authService.refreshToken.mockResolvedValue({
      token: 'tok',
      user: { id: 'user-1', name: 'Admin', role: 'Administrator' },
    });

    renderWithProvider();
    await waitFor(() => expect(screen.queryByTestId('init')).toBeNull());

    await userEvent.click(screen.getByText('logout'));

    await waitFor(() => expect(screen.getByTestId('user').textContent).toBe('none'));
    expect(authService.logout).toHaveBeenCalled();
  });

  it('updateUser applies the profile returned by authService.updateProfile', async () => {
    authService.refreshToken.mockResolvedValue({
      token: 'tok',
      user: { id: 'user-1', name: 'Admin', role: 'Administrator' },
    });
    authService.updateProfile.mockResolvedValue({ id: 'user-1', name: 'Admin Updated', role: 'Administrator' });

    renderWithProvider();
    await waitFor(() => expect(screen.queryByTestId('init')).toBeNull());

    await userEvent.click(screen.getByText('update'));

    await waitFor(() => expect(screen.getByTestId('user').textContent).toBe('Admin Updated'));
  });

  it('hasRole returns false for non-matching roles', async () => {
    authService.refreshToken.mockResolvedValue({
      token: 'tok',
      user: { id: 'user-1', name: 'Staff', role: 'Warehouse Staff' },
    });

    renderWithProvider();
    await waitFor(() => expect(screen.queryByTestId('init')).toBeNull());

    expect(screen.getByTestId('has-admin').textContent).toBe('false');
  });
});
