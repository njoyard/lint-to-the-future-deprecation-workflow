import { afterEach, describe, expect, it } from 'vitest';
import getDeprecationWorkflowFile from '../../lib/files';
import { inProject } from '../util';

describe('getDeprecationWorkflowFile', () => {
  const initialCwd = process.cwd();

  afterEach(() => {
    delete process.env.LTTF_DEPRECATIONS_FILE;
    process.chdir(initialCwd);
  });

  it('finds app js file', () => {
    inProject('js');
    expect(getDeprecationWorkflowFile()).toBe('app/deprecation-workflow.js');
  });

  it('finds app ts file', () => {
    inProject('ts');
    expect(getDeprecationWorkflowFile()).toBe('app/deprecation-workflow.ts');
  });

  it('finds addon dummy app js file', () => {
    inProject('js-addon');
    expect(getDeprecationWorkflowFile()).toBe(
      'tests/dummy/app/deprecation-workflow.js',
    );
  });

  it('finds addon dummy app ts file', () => {
    inProject('ts-addon');
    expect(getDeprecationWorkflowFile()).toBe(
      'tests/dummy/app/deprecation-workflow.ts',
    );
  });

  it('finds custom file from env var', () => {
    inProject('custom');
    process.env.LTTF_DEPRECATIONS_FILE = 'custom/custom.js';
    expect(getDeprecationWorkflowFile()).toBe('custom/custom.js');
  });

  it('throws when no file is found', () => {
    inProject('none');
    expect(() => getDeprecationWorkflowFile()).toThrowError(
      'Cannot find deprecation workflow config file, use the LTTF_DEPRECATIONS_FILE environment variable',
    );
  });

  it('throws when env var file is not found', () => {
    inProject('custom');
    process.env.LTTF_DEPRECATIONS_FILE = 'custom/not-found.js';
    expect(() => getDeprecationWorkflowFile()).toThrowError(
      'Cannot find deprecation workflow config file custom/not-found.js',
    );
  });
});
