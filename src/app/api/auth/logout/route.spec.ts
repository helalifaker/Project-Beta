/**
 * Tests for logout API route
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from './route';
import { logout } from '@/lib/auth/utils';

vi.mock('@/lib/auth/utils', () => ({
  logout: vi.fn(),
}));

describe('POST /api/auth/logout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 200 for successful logout', async () => {
    vi.mocked(logout).mockResolvedValue({ error: null });

    const response = await POST();

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.message).toBe('Logout successful');
  });

  it('should return 500 for logout error', async () => {
    vi.mocked(logout).mockResolvedValue({
      error: new Error('Logout failed'),
    });

    const response = await POST();

    expect(response.status).toBe(500);
    const data = await response.json();
    expect(data.error).toBe('LOGOUT_ERROR');
  });

  it('should handle generic errors', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.mocked(logout).mockRejectedValue(new Error('Database error'));

    const response = await POST();

    expect(response.status).toBe(500);
    const data = await response.json();
    expect(data.error).toBe('INTERNAL_ERROR');
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });
});

