import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthProvider } from './AuthContext';
import { useAuth } from '@/hooks/useAuth';
import * as authService from '@/services/authService';

vi.mock('@/services/authService');

function encodeSegment(value) {
  const json = JSON.stringify(value);
  const base64 = btoa(unescape(encodeURIComponent(json)));
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function makeToken(payload) {
  return `${encodeSegment({ alg: 'HS256', typ: 'JWT' })}.${encodeSegment(payload)}.signature`;
}

function TestConsumer() {
  const { user, isAuthenticated, login, logout, updateUser, hasRole } = useAuth();
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
});

describe('AuthProvider', () => {
  it('starts unauthenticated when localStorage is empty', () => {
    authService.getToken.mockReturnValue(null);
    authService.getCurrentUser.mockReturnValue(null);

    renderWithProvider();

    expect(screen.getByTestId('authenticated').textContent).toBe('false');
    expect(screen.getByTestId('user').textContent).toBe('none');
  });

  it('clears a stale session when the stored token is expired', () => {
    const expiredToken = makeToken({ sub: 'user-1', exp: Math.floor(Date.now() / 1000) - 60 });
    authService.getToken.mockReturnValue(expiredToken);
    authService.getCurrentUser.mockReturnValue({ id: 'user-1', name: 'Admin', role: 'Administrator' });

    renderWithProvider();

    expect(authService.logout).toHaveBeenCalled();
    expect(screen.getByTestId('authenticated').textContent).toBe('false');
  });

  it('restores the session when the stored token is valid', () => {
    const validToken = makeToken({ sub: 'user-1', exp: Math.floor(Date.now() / 1000) + 3600 });
    authService.getToken.mockReturnValue(validToken);
    authService.getCurrentUser.mockReturnValue({ id: 'user-1', name: 'Admin', role: 'Administrator' });

    renderWithProvider();

    expect(screen.getByTestId('authenticated').textContent).toBe('true');
    expect(screen.getByTestId('user').textContent).toBe('Admin');
    expect(screen.getByTestId('has-admin').textContent).toBe('true');
  });

  it('login sets the user returned by authService.login', async () => {
    authService.getToken.mockReturnValue(null);
    authService.getCurrentUser.mockReturnValue(null);
    authService.login.mockResolvedValue({
      user: { id: 'user-2', name: 'New User', role: 'Warehouse Staff' },
      token: 'tok',
    });

    renderWithProvider();
    await userEvent.click(screen.getByText('login'));

    await waitFor(() => expect(screen.getByTestId('user').textContent).toBe('New User'));
    expect(authService.login).toHaveBeenCalledWith('admin@pharmatrack.com', 'admin123');
  });

  it('logout clears the current user', async () => {
    const validToken = makeToken({ sub: 'user-1', exp: Math.floor(Date.now() / 1000) + 3600 });
    authService.getToken.mockReturnValue(validToken);
    authService.getCurrentUser.mockReturnValue({ id: 'user-1', name: 'Admin', role: 'Administrator' });

    renderWithProvider();
    await userEvent.click(screen.getByText('logout'));

    expect(authService.logout).toHaveBeenCalled();
    expect(screen.getByTestId('user').textContent).toBe('none');
  });

  it('updateUser applies the profile returned by authService.updateProfile', async () => {
    const validToken = makeToken({ sub: 'user-1', exp: Math.floor(Date.now() / 1000) + 3600 });
    authService.getToken.mockReturnValue(validToken);
    authService.getCurrentUser.mockReturnValue({ id: 'user-1', name: 'Admin', role: 'Administrator' });
    authService.updateProfile.mockResolvedValue({ id: 'user-1', name: 'Admin Updated', role: 'Administrator' });

    renderWithProvider();
    await userEvent.click(screen.getByText('update'));

    await waitFor(() => expect(screen.getByTestId('user').textContent).toBe('Admin Updated'));
  });
});
