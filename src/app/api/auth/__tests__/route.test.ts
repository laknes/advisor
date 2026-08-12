import { AppError } from '@/lib/errors';
import { POST } from '@/app/api/auth/route';
import { UserService } from '@/server/services/UserService';
import { NextRequest } from 'next/server';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';

vi.mock('@/server/services/UserService', () => ({
  UserService: {
    register: vi.fn(),
    login: vi.fn(),
    requestOtp: vi.fn(),
    verifyOtp: vi.fn(),
  },
}));

let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

beforeAll(() => {
  consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
});

afterAll(() => {
  consoleErrorSpy.mockRestore();
});

describe('POST /api/auth OTP actions', () => {
  it('returns OTP payload on request-otp success', async () => {
    vi.mocked(UserService.requestOtp).mockResolvedValueOnce({
      phone: '09123456789',
      expiresInSeconds: 300,
      resendAfterSeconds: 60,
      devCode: '123456',
    });

    const req = new NextRequest('http://localhost:3000/api/auth?action=request-otp', {
      method: 'POST',
      body: JSON.stringify({ phone: '09123456789', purpose: 'login' }),
      headers: { 'content-type': 'application/json' },
    });

    const res = await POST(req);
    const payload = await res.json();

    expect(res.status).toBe(200);
    expect(payload.success).toBe(true);
    expect(payload.data.otp.phone).toBe('09123456789');
    expect(payload.data.otp.resendAfterSeconds).toBe(60);
  });

  it('returns 400 on verify-otp validation failure', async () => {
    const req = new NextRequest('http://localhost:3000/api/auth?action=verify-otp', {
      method: 'POST',
      body: JSON.stringify({ phone: '09123456789', purpose: 'login' }),
      headers: { 'content-type': 'application/json' },
    });

    const res = await POST(req);
    const payload = await res.json();

    expect(res.status).toBe(400);
    expect(payload.error).toBe('Validation failed');
    expect(payload.errors.code).toBeDefined();
  });

  it('returns 429 when OTP request is rate-limited', async () => {
    vi.mocked(UserService.requestOtp).mockRejectedValueOnce(
      new AppError('Please wait 60 seconds before requesting another code', 429, 'OTP_RATE_LIMITED'),
    );

    const req = new NextRequest('http://localhost:3000/api/auth?action=request-otp', {
      method: 'POST',
      body: JSON.stringify({ phone: '09123456789', purpose: 'login' }),
      headers: { 'content-type': 'application/json' },
    });

    const res = await POST(req);
    const payload = await res.json();

    expect(res.status).toBe(429);
    expect(payload.code).toBe('OTP_RATE_LIMITED');
  });

  it('returns 400 when OTP code is invalid or expired', async () => {
    vi.mocked(UserService.verifyOtp).mockRejectedValueOnce(
      new AppError('OTP code is expired or invalid', 400, 'OTP_INVALID'),
    );

    const req = new NextRequest('http://localhost:3000/api/auth?action=verify-otp', {
      method: 'POST',
      body: JSON.stringify({ phone: '09123456789', code: '111111', purpose: 'login' }),
      headers: { 'content-type': 'application/json' },
    });

    const res = await POST(req);
    const payload = await res.json();

    expect(res.status).toBe(400);
    expect(payload.code).toBe('OTP_INVALID');
  });

  it('returns 429 when OTP max attempts is exceeded', async () => {
    vi.mocked(UserService.verifyOtp).mockRejectedValueOnce(
      new AppError('OTP max attempts exceeded', 429, 'OTP_MAX_ATTEMPTS'),
    );

    const req = new NextRequest('http://localhost:3000/api/auth?action=verify-otp', {
      method: 'POST',
      body: JSON.stringify({ phone: '09123456789', code: '111111', purpose: 'login' }),
      headers: { 'content-type': 'application/json' },
    });

    const res = await POST(req);
    const payload = await res.json();

    expect(res.status).toBe(429);
    expect(payload.code).toBe('OTP_MAX_ATTEMPTS');
  });
});
