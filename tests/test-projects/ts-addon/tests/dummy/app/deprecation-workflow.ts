import setupDeprecationWorkflow from 'ember-cli-deprecation-workflow';

setupDeprecationWorkflow({
  workflow: [
    {
      matchId: 'silenced-1',
      handler: 'silence',
    },
    {
      matchId: 'silenced-2',
      handler: 'silence',
    },
    {
      matchId: 'logged',
      handler: 'log',
    },
    {
      matchId: 'thrown',
      handler: 'throw',
    },
    {
      matchMessage: 'foobar',
      handler: 'silence',
    },
  ],
});

