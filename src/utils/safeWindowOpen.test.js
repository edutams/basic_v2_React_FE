import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { safeWindowOpen } from './safeWindowOpen';

describe('safeWindowOpen', () => {
  beforeEach(() => {
    vi.spyOn(window, 'open').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('opens a same-origin https URL', () => {
    expect(safeWindowOpen('https://school.example.com/login')).toBe(true);
    expect(window.open).toHaveBeenCalledWith('https://school.example.com/login', '_blank');
  });

  it('opens a different-origin https URL (tenant custom domains are expected)', () => {
    expect(safeWindowOpen('https://a-completely-different-domain.com/impersonate-login/abc')).toBe(true);
    expect(window.open).toHaveBeenCalled();
  });

  it('refuses a javascript: URL', () => {
    expect(safeWindowOpen('javascript:alert(1)')).toBe(false);
    expect(window.open).not.toHaveBeenCalled();
  });

  it('refuses a data: URL', () => {
    expect(safeWindowOpen('data:text/html,<script>alert(1)</script>')).toBe(false);
    expect(window.open).not.toHaveBeenCalled();
  });

  it('refuses an empty/falsy URL', () => {
    expect(safeWindowOpen('')).toBe(false);
    expect(safeWindowOpen(null)).toBe(false);
    expect(window.open).not.toHaveBeenCalled();
  });
});
