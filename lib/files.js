import { existsSync } from 'fs';

export default function getDeprecationWorkflowFile() {
  const candidates = process.env.LTTF_DEPRECATIONS_FILE
    ? [process.env.LTTF_DEPRECATIONS_FILE]
    : [
        'app/deprecation-workflow.js',
        'app/deprecation-workflow.ts',
        'tests/dummy/app/deprecation-workflow.js',
        'tests/dummy/app/deprecation-workflow.ts',
      ];

  for (const file of candidates) {
    if (existsSync(file)) {
      return file;
    }
  }

  if (process.env.LTTF_DEPRECATIONS_FILE) {
    throw new Error(
      `Cannot find deprecation workflow config file ${process.env.LTTF_DEPRECATIONS_FILE}`,
    );
  } else {
    throw new Error(
      'Cannot find deprecation workflow config file, use the LTTF_DEPRECATIONS_FILE environment variable',
    );
  }
}
