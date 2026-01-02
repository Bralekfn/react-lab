import LZString from 'lz-string';
import { type File } from '../data/templates';

export const compressFiles = (files: Record<string, File>): string => {
  try {
    const json = JSON.stringify(files);
    return LZString.compressToEncodedURIComponent(json);
  } catch (error) {
    console.error('Failed to compress files:', error);
    return '';
  }
};

export const decompressFiles = (compressed: string): Record<string, File> | null => {
  try {
    const json = LZString.decompressFromEncodedURIComponent(compressed);
    if (!json) return null;
    return JSON.parse(json);
  } catch (error) {
    console.error('Failed to decompress files:', error);
    return null;
  }
};
