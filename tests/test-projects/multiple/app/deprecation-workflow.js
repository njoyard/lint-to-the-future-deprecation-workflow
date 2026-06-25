import setupDeprecationWorkflow from 'ember-cli-deprecation-workflow';

if (process.env.NODE_ENV === 'test') {
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
} else {
  setupDeprecationWorkflow({
    workflow: [
      {
        matchId: 'silenced-3',
        handler: 'silence',
      },
      {
        matchId: 'logged-2',
        handler: 'log',
      },
      {
        matchId: 'thrown-2',
        handler: 'throw',
      },
    ],
  });
}
