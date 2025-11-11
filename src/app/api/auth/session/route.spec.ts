/**
 * Tests for session API route
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

import { getServerSession } from '@/lib/auth/session';

import { GET } from './route';

vi.mock('@/lib/auth/session', () => ({
  getServerSession: vi.fn(),
}));

describe('GET /api/auth/session', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 when no session', async () => {
    vi.mocked(getServerSession).mockResolvedValue(null);

    const response = await GET();

    expect(response.status).toBe(401);
    const data = await response.json();
    expect(data.error).toBe('UNAUTHORIZED');
  });

  it('should return 200 with session data', async () => {
    const mockSession = {
      user: {
        id: 'user-1',
        email: 'test@example.com',
        role: 'ADMIN' as const,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      accessToken: 'token',
      expiresAt: new Date('2024-12-31T00:00:00.000Z'),
    };

    vi.mocked(getServerSession).mockResolvedValue(mockSession);

    const response = await GET();

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.data.user).toMatchObject({
      id: mockSession.user.id,
      email: mockSession.user.email,
      role: mockSession.user.role,
    });
    expect(data.data.expiresAt).toBe(mockSession.expiresAt.toISOString());
  });

  it('should handle generic errors', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.mocked(getServerSession).mockRejectedValue(new Error('Database error'));

    const response = await GET();

    expect(response.status).toBe(500);
    const data = await response.json();
    expect(data.error).toBe('INTERNAL_ERROR');
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });
});

