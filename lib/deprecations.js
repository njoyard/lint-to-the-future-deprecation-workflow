import traverse from '@babel/traverse';
import { parse } from '@babel/parser';
const IMPORT_FROM = 'ember-cli-deprecation-workflow';

/**
 * Returns a set of names ̀`setupDeprecationWorkflow` is imported as
 */
export function findSetupNames(ast) {
  const names = new Set();

  traverse(ast, {
    // import setupDeprecationWorkflow from 'ember-cli-deprecation-workflow';
    ImportDeclaration(path) {
      if (path.node.source.value !== IMPORT_FROM) {
        return;
      }

      for (const specifier of path.node.specifiers) {
        if (specifier.type === 'ImportDefaultSpecifier') {
          names.add(specifier.local.name);
        }
      }
    },

    // const setupDeprecationWorkflow = require('ember-cli-deprecation-workflow');
    VariableDeclarator(path) {
      const { node } = path;

      if (
        // LHS is identifier
        node.id.type === 'Identifier' &&
        // RHS is require('ember-cli-deprecation-workflow')
        node.init?.type === 'CallExpression' &&
        node.init.callee.type === 'Identifier' &&
        node.init.callee.name === 'require' &&
        node.init.arguments[0]?.value === IMPORT_FROM
      ) {
        names.add(node.id.name);
      }
    },
  });

  return names;
}

export function getObjectExpressionValue(node) {
  if (node.type !== 'ObjectExpression') {
    throw new Error('Expected ObjectExpression');
  }

  const result = {};

  for (const prop of node.properties) {
    if (prop.type !== 'ObjectProperty') {
      throw new Error('Unsupported property type');
    }

    const key = prop.key.type === 'Identifier' ? prop.key.name : prop.key.value;

    result[key] = getNodeValue(prop.value);
  }

  return result;
}

export function getNodeValue(node) {
  switch (node.type) {
    case 'StringLiteral':
    case 'NumericLiteral':
    case 'BooleanLiteral':
      return node.value;

    case 'NullLiteral':
      return null;

    case 'ObjectExpression':
      return getObjectExpressionValue(node);

    case 'ArrayExpression':
      return node.elements.map(getNodeValue);

    default:
      throw new Error(`Unsupported node type: ${node.type}`);
  }
}

/**
 * Returns an array of all object expressions passed to `setupDeprecationWorkflow` calls or its aliases
 */
export function getSetupObjects(ast, names, file) {
  const found = [];

  traverse(ast, {
    CallExpression(path) {
      if (
        path.node.callee.type === 'Identifier' &&
        names.has(path.node.callee.name) &&
        path.node.arguments.length > 0
      ) {
        try {
          found.push(getObjectExpressionValue(path.node.arguments[0]));
        } catch {
          console.warn(
            `Warning: dynamic ember-cli-deprecation-workflow configuration found in ${file} on line ${path.node.loc.start.line}, ignoring`,
          );
        }
      }
    },
  });

  return found;
}

/**
 * Returns a set of all deprecations that are silenced in at least one `setupDeprecationWorkflow` call
 */
export default function getSilencedDeprecations(source, file) {
  const ast = parse(source, {
    sourceType: 'unambiguous',
    plugins: ['typescript'],
  });

  const names = findSetupNames(ast);
  const objs = getSetupObjects(ast, names, file);
  const silenced = new Set();

  for (const obj of objs) {
    if (obj.workflow) {
      for (const deprecation of obj.workflow) {
        if (deprecation.matchId && deprecation.handler === 'silence') {
          silenced.add(deprecation.matchId);
        }
      }
    }
  }

  return silenced;
}
