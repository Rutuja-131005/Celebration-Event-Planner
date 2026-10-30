import { describe, it, expect } from 'vitest';
import { runTestSuite } from '../../server/tests/api.test.ts';

describe('Server Security, API & Database Coverage Suite', () => {
  it('executes all 20 security and reliability verification suites', async () => {
    const result = await runTestSuite();
    expect(result.success).toBe(true);
    expect(result.results.length).toBeGreaterThanOrEqual(60);
    const failed = result.results.filter((r) => !r.passed);
    expect(failed).toHaveLength(0);
  }, 30000);
});
