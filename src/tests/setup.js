import '@testing-library/jest-dom';
import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// Extends Vitest's expect with jest-dom matchers
afterEach(() => {
  cleanup();
});
