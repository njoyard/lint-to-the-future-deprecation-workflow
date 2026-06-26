import getDeprecationWorkflowFile from './files.js';
import getSilencedDeprecations from './deprecations.js';
import { readFileSync } from 'fs';

export default function list() {
  const file = getDeprecationWorkflowFile();
  const silenced = getSilencedDeprecations(readFileSync(file, 'utf-8'), file);

  return [...silenced].reduce((all, id) => ({ ...all, [id]: file }), {});
}
