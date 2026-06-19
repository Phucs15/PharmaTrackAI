import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import ForgotPasswordPage from './ForgotPasswordPage';
import * as authService from '@/services/authService';

vi.mock('@/services/authService');

function renderPage() {
  return render(
    <MemoryRouter>
      <ForgotPasswordPage />
    </MemoryRouter>
  );
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('ForgotPasswordPage', () => {
  it('renders the email input and submit button', () => {
    renderPage();
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /send reset link/i })).toBeInTheDocument();
  });

  it('shows the success state after a successful API call', async () => {
    authService.forgotPassword.mockResolvedValue({ message: 'If an account…' });
    renderPage();

    await userEvent.type(screen.getByLabelText(/email address/i), 'admin@pharmatrack.com');
    await userEvent.click(screen.getByRole('button', { name: /send reset link/i }));

    await waitFor(() => {
      expect(screen.getByText(/if an account exists for/i)).toBeInTheDocument();
    });
    expect(authService.forgotPassword).toHaveBeenCalledWith('admin@pharmatrack.com');
  });

  it('shows an error message when the API call fails', async () => {
    authService.forgotPassword.mockRejectedValue({
      response: { data: { message: 'Something went wrong on the server.' } },
    });
    renderPage();

    // Use a well-formed email so the browser doesn't block form submission;
    // the server-side error is what we're testing here.
    await userEvent.type(screen.getByLabelText(/email address/i), 'unknown@example.com');
    await userEvent.click(screen.getByRole('button', { name: /send reset link/i }));

    await waitFor(() => {
      expect(screen.getByText(/something went wrong on the server/i)).toBeInTheDocument();
    });
  });
});
