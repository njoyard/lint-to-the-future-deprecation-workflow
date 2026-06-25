# lint-to-the-future-deprecation-workflow

`lint-to-the-future-deprecation-workflow` is a plugin for [lint-to-the-future](https://github.com/mansona/lint-to-the-future) to add deprecations silenced with [ember-cli-deprecation-workflow](https://github.com/ember-cli/ember-cli-deprecation-workflow) to your LttF dashboards.

For more information about how lint-to-the-future works [checkout the readme](https://github.com/mansona/lint-to-the-future#readme).

This plugin reports one violation for each silenced deprecation in your project.

## Usage

Install `lint-to-the-future-deprecation-workflow` alongside `lint-to-the-future` as a dev dependency. Lint-to-the-future will find and call the plugin automatically.

## Caveats

- This plugin has no ignore/remove capability. The `ignore` operation is a noop - this is by design. Update your `ember-cli-deprecation-workflow` configuration manually.
- Your configuration must be static for this plugin to work - that is you must pass a an object literal with static content to `setupDeprecationWorkflow`.
- This plugin only considers deprecations configured with `matchId`. `matchMessage` is ignored.
- Contrary to lint rules that can be enforced by static analysis, deprecations are dynamic and triggered at runtime (or build-time). There is no easy way to determine where in your code a deprecation was triggered (or if it was even triggered by your code, vs. a dependency for example). As a consequence, this plugin will only ever report violations in one file - the deprecation workflow setup file.

## Configuration

The plugin looks for a deprecation workflow setup file at the following locations, and will use the first one it finds:

- `app/deprecation-workflow.js`
- `app/deprecation-workflow.ts`
- `tests/dummy/app/deprecation-workflow.js`
- `tests/dummy/app/deprecation-workflow.ts`

If it cannot find any, no silenced deprecations will be reported. To specify an alternative path, use the `LTTF_DEPRECATIONS_FILE` environment variable.
