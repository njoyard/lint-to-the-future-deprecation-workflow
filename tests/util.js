import { resolve } from 'path';

const projectsRoot = resolve(import.meta.dirname, 'test-projects');

export function inProject(name) {
  process.chdir(resolve(projectsRoot, name));
}
