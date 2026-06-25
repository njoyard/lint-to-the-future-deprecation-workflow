export { default as list } from './lib/list.js';

// The following avoid LttF producing error messages

export const capabilities = ['filter-ignore'];

export function ignoreAll() {
  // Noop
}

export function remove() {
  // Noop
}
