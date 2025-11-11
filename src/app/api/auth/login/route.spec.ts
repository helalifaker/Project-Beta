/**
 * Tests for login API route
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

import { loginWithPassword } from '@/lib/auth/utils';

import { POST } from './route';

vi.mock('@/lib/auth/utils', () => ({
  loginWithPassword: vi.fn(),
}));

describe('POST /api/auth/login', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 400 for invalid input', async () => {
    const request = new Request('http://localhost/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'invalid-email', password: '123' }),
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toBe('VALIDATION_ERROR');
  });

  it('should return 401 for invalid credentials', async () => {
    vi.mocked(loginWithPassword).mockResolvedValue({
      error: new Error('Invalid credentials'),
    });

    const request = new Request('http://localhost/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123',
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(401);
    const data = await response.json();
    expect(data.error).toBe('AUTH_ERROR');
  });

  it('should return 200 for successful login', async () => {
    vi.mocked(loginWithPassword).mockResolvedValue({ error: null });

    const request = new Request('http://localhost/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123',
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.success).toBe(true);
  });

  it('should handle generic errors', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.mocked(loginWithPassword).mockRejectedValue(new Error('Database error'));

    const request = new Request('http://localhost/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123',
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(500);
    const data = await response.json();
    expect(data.error).toBe('INTERNAL_ERROR');
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });
});

