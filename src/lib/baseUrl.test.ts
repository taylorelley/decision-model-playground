import { normalizeBaseUrl } from './baseUrl';

const paths = ['/v1/systemone', '/v1/models'];

describe('normalizeBaseUrl', () => {
  it('keeps a server root as is', () => {
    expect(normalizeBaseUrl('http://host:8080', paths)).toBe('http://host:8080');
    expect(normalizeBaseUrl('http://host:8080/', paths)).toBe('http://host:8080');
  });
  it('strips a full endpoint path copied from a curl example', () => {
    expect(normalizeBaseUrl('http://host:8080/v1/systemone', paths)).toBe('http://host:8080');
    expect(normalizeBaseUrl('http://host:8080/v1/systemone/', paths)).toBe('http://host:8080');
  });
  it('strips a leading part of the endpoint path', () => {
    expect(normalizeBaseUrl('https://api.example.com/v1', paths)).toBe('https://api.example.com');
  });
  it('keeps an unrelated reverse-proxy prefix', () => {
    expect(normalizeBaseUrl('https://example.com/models', paths)).toBe(
      'https://example.com/models',
    );
    expect(normalizeBaseUrl('https://example.com/models/v1/systemone', paths)).toBe(
      'https://example.com/models',
    );
  });
  it('handles empty and unparseable values', () => {
    expect(normalizeBaseUrl('', paths)).toBe('');
    expect(normalizeBaseUrl('not a url', paths)).toBe('not a url');
  });
});
