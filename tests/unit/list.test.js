import { afterEach, describe, expect, it } from 'vitest';
import { inProject } from '../util.js';
import list from '../../lib/list.js';

describe('list', () => {
  const initialCwd = process.cwd();

  afterEach(() => {
    delete process.env.LTTF_DEPRECATIONS_FILE;
    process.chdir(initialCwd);
  });

  it('lists from app js file', () => {
    inProject('js');
    expect(list()).toEqual({
      'silenced-1': ['app/deprecation-workflow.js'],
      'silenced-2': ['app/deprecation-workflow.js'],
    });
  });

  it('lists from app ts file', () => {
    inProject('ts');
    expect(list()).toEqual({
      'silenced-1': ['app/deprecation-workflow.ts'],
      'silenced-2': ['app/deprecation-workflow.ts'],
    });
  });

  it('lists from addon dummy app js file', () => {
    inProject('js-addon');
    expect(list()).toEqual({
      'silenced-1': ['tests/dummy/app/deprecation-workflow.js'],
      'silenced-2': ['tests/dummy/app/deprecation-workflow.js'],
    });
  });

  it('lists from addon dummy app ts file', () => {
    inProject('ts-addon');
    expect(list()).toEqual({
      'silenced-1': ['tests/dummy/app/deprecation-workflow.ts'],
      'silenced-2': ['tests/dummy/app/deprecation-workflow.ts'],
    });
  });

  it('lists from custom file from env var', () => {
    inProject('custom');
    process.env.LTTF_DEPRECATIONS_FILE = 'custom/custom.js';
    expect(list()).toEqual({
      'silenced-1': ['custom/custom.js'],
      'silenced-2': ['custom/custom.js'],
    });
  });

  it('throws when no file is found', () => {
    inProject('none');
    expect(() => list()).toThrowError(
      'Cannot find deprecation workflow config file, use the LTTF_DEPRECATIONS_FILE environment variable',
    );
  });

  it('throws when env var file is not found', () => {
    inProject('custom');
    process.env.LTTF_DEPRECATIONS_FILE = 'custom/not-found.js';
    expect(() => list()).toThrowError(
      'Cannot find deprecation workflow config file custom/not-found.js',
    );
  });

  it('lists from multiple setup calls', () => {
    inProject('multiple');
    expect(list()).toEqual({
      'silenced-1': ['app/deprecation-workflow.js'],
      'silenced-2': ['app/deprecation-workflow.js'],
      'silenced-3': ['app/deprecation-workflow.js'],
    });
  });
});
