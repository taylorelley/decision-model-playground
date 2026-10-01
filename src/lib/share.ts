import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from 'lz-string';
import type { EvaluateRequest } from '../api/types';

export function encodeRequest(req: EvaluateRequest): string {
  return compressToEncodedURIComponent(JSON.stringify(req));
}

export function decodeRequest(encoded: string): EvaluateRequest | null {
  try {
    const json = decompressFromEncodedURIComponent(encoded);
    if (!json) return null;
    const parsed = JSON.parse(json) as EvaluateRequest;
    if (parsed && typeof parsed === 'object' && 'questions' in parsed) return parsed;
    return null;
  } catch {
    return null;
  }
}
