import { describe, it, expect } from 'vitest';
import { sanitizeHtml } from './sanitizeHtml';

describe('sanitizeHtml', () => {
  it('strips script tags', () => {
    const result = sanitizeHtml('<p>hello</p><script>alert("xss")</script>');
    expect(result).not.toContain('<script>');
    expect(result).not.toContain('alert');
    expect(result).toContain('<p>hello</p>');
  });

  it('strips inline event handlers', () => {
    const result = sanitizeHtml('<img src="x.png" onerror="alert(1)" />');
    expect(result).not.toContain('onerror');
  });

  it('strips javascript: URLs', () => {
    const result = sanitizeHtml('<a href="javascript:alert(1)">click</a>');
    expect(result).not.toContain('javascript:');
  });

  it('preserves benign formatting tags', () => {
    const html = '<p>Dear <strong>John</strong>,</p><ul><li>Item one</li></ul>';
    const result = sanitizeHtml(html);
    expect(result).toContain('<strong>John</strong>');
    expect(result).toContain('<ul>');
    expect(result).toContain('<li>Item one</li>');
  });

  it('returns an empty string for falsy input', () => {
    expect(sanitizeHtml('')).toBe('');
    expect(sanitizeHtml(null)).toBe('');
    expect(sanitizeHtml(undefined)).toBe('');
  });
});
