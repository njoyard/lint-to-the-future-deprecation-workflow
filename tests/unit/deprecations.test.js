import { describe, expect, it, vi } from 'vitest';
import { parse } from '@babel/parser';
import getSilencedDeprecations, {
  findSetupNames,
  getNodeValue,
  getObjectExpressionValue,
  getSetupObjects,
} from '../../lib/deprecations.js';

describe('findSetupNames', () => {
  it('finds import setupDeprecationWorkflow', () => {
    const importVanilla = `
      import setupDeprecationWorkflow from 'ember-cli-deprecation-workflow';
    `;

    expect(
      findSetupNames(parse(importVanilla, { sourceType: 'module' })),
    ).toEqual(new Set(['setupDeprecationWorkflow']));
  });

  it('finds import alias', () => {
    const importAlias = `
      import foo from 'ember-cli-deprecation-workflow';
    `;

    expect(
      findSetupNames(parse(importAlias, { sourceType: 'module' })),
    ).toEqual(new Set(['foo']));
  });

  it('finds multiple imports', () => {
    const importMultiple = `
      import setupDeprecationWorkflow from 'ember-cli-deprecation-workflow';
      import foo from 'ember-cli-deprecation-workflow';
    `;

    expect(
      findSetupNames(parse(importMultiple, { sourceType: 'module' })),
    ).toEqual(new Set(['setupDeprecationWorkflow', 'foo']));
  });

  it('finds const setupDeprecationWorkflow = require(...)', () => {
    const requireVanilla = `
      const setupDeprecationWorkflow = require('ember-cli-deprecation-workflow');
    `;

    expect(
      findSetupNames(parse(requireVanilla, { sourceType: 'module' })),
    ).toEqual(new Set(['setupDeprecationWorkflow']));
  });

  it('finds const foo = require(...)', () => {
    const requireAlias = `
      const foo = require('ember-cli-deprecation-workflow');
    `;

    expect(
      findSetupNames(parse(requireAlias, { sourceType: 'module' })),
    ).toEqual(new Set(['foo']));
  });

  it('finds multiple requires', () => {
    const requireMultiple = `
      const setupDeprecationWorkflow = require('ember-cli-deprecation-workflow');
      const foo = require('ember-cli-deprecation-workflow');
    `;

    expect(
      findSetupNames(parse(requireMultiple, { sourceType: 'module' })),
    ).toEqual(new Set(['setupDeprecationWorkflow', 'foo']));
  });
});

describe('getObjectExpressionValue', () => {
  it('gets object expression value', () => {
    const ast = parse(
      `
        const obj = {
          foo: 'bar',
          baz: 42,
          qux: true,
          nested: {
            a: 'b',
            c: 3,
          },
        };
      `,
      { sourceType: 'module' },
    );

    const objNode = ast.program.body[0].declarations[0].init;

    expect(getObjectExpressionValue(objNode)).toEqual({
      foo: 'bar',
      baz: 42,
      qux: true,
      nested: {
        a: 'b',
        c: 3,
      },
    });
  });
});

describe('getNodeValue', () => {
  it('gets string value', () => {
    expect(getNodeValue({ type: 'StringLiteral', value: 'foo' })).toEqual(
      'foo',
    );
  });

  it('gets numeric value', () => {
    expect(getNodeValue({ type: 'NumericLiteral', value: 42 })).toEqual(42);
  });

  it('gets boolean value', () => {
    expect(getNodeValue({ type: 'BooleanLiteral', value: true })).toEqual(true);
  });

  it('gets null value', () => {
    expect(getNodeValue({ type: 'NullLiteral' })).toEqual(null);
  });

  it('gets object value', () => {
    expect(
      getNodeValue({
        type: 'ObjectExpression',
        properties: [
          {
            type: 'ObjectProperty',
            key: { type: 'Identifier', name: 'foo' },
            value: { type: 'StringLiteral', value: 'bar' },
          },
        ],
      }),
    ).toEqual({ foo: 'bar' }, 'gets object value');
  });

  it('gets array value', () => {
    expect(
      getNodeValue({
        type: 'ArrayExpression',
        elements: [
          { type: 'StringLiteral', value: 'foo' },
          { type: 'NumericLiteral', value: 42 },
        ],
      }),
    ).toEqual(['foo', 42], 'gets array value');
  });

  it('throws for unsupported node type', () => {
    expect(() => getNodeValue({ type: 'UnknownType' })).toThrow(
      'Unsupported node type: UnknownType',
    );
  });
});

describe('getSetupObjects', () => {
  it('finds all literal setupDeprecationWorkflow args', () => {
    const workflow1 = [
      {
        matchId: 'deprecation-1',
        handler: 'silence',
      },
      {
        matchId: 'deprecation-2',
        handler: 'log',
      },
    ];

    const workflow2 = [
      {
        matchId: 'deprecation-3',
        handler: 'silence',
      },
      {
        matchMessage: 'deprecation-4',
        handler: 'silence',
      },
    ];

    const source = `
      if (process.env.NODE_ENV === 'test') {
        setupDeprecationWorkflow({
          workflow: ${JSON.stringify(workflow1)},
        });
      } else {
        fooBarBaz({
          workflow: ${JSON.stringify(workflow2)},
        });
      }
    `;

    const setupObjects = getSetupObjects(
      parse(source, { sourceType: 'module' }),
      new Set(['setupDeprecationWorkflow', 'fooBarBaz']),
    );

    expect(setupObjects.length).toBe(2);
    expect(setupObjects[0].workflow).toEqual(workflow1);
    expect(setupObjects[1].workflow).toEqual(workflow2);
  });

  it('ignores and warns about non-literal setupDeprecationWorkflow args', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const variable = `setupDeprecationWorkflow(workflow);`;

    const variableSetupObjects = getSetupObjects(
      parse(variable, { sourceType: 'module' }),
      new Set(['setupDeprecationWorkflow']),
      'test-variable-file.js',
    );

    expect(variableSetupObjects.length).toBe(0);
    expect(warnSpy).toHaveBeenCalledWith(
      'Warning: dynamic ember-cli-deprecation-workflow configuration found in test-variable-file.js on line 1, ignoring',
    );

    const dynamic = `setupDeprecationWorkflow({ workflow: some_workflow });`;

    const dynamicSetupObjects = getSetupObjects(
      parse(dynamic, { sourceType: 'module' }),
      new Set(['setupDeprecationWorkflow']),
      'test-dynamic-file.js',
    );

    expect(dynamicSetupObjects.length).toBe(0);
    expect(warnSpy).toHaveBeenLastCalledWith(
      'Warning: dynamic ember-cli-deprecation-workflow configuration found in test-dynamic-file.js on line 1, ignoring',
    );

    warnSpy.mockRestore();
  });
});

describe('getSilencedDeprecations', () => {
  it('returns all silenced deprecations', () => {
    const source = `
      import setupDeprecationWorkflow from 'ember-cli-deprecation-workflow';
      import fooBarBaz from 'ember-cli-deprecation-workflow';
      
      if (process.env.NODE_ENV === 'test') {
        setupDeprecationWorkflow({
          workflow: [
            {
              matchId: 'deprecation-1',
              handler: 'silence',
            },
            {
              matchId: 'deprecation-2',
              handler: 'log',
            },
          ]
        });
      } else {
        fooBarBaz({
          workflow: [
            {
              matchId: 'deprecation-3',
              handler: 'silence',
            },
            {
              matchMessage: 'deprecation-4',
              handler: 'silence',
            },
          ]
        });
      }
    `;

    const silenced = getSilencedDeprecations(source);

    expect(silenced).toEqual(new Set(['deprecation-1', 'deprecation-3']));
  });
});
