module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat',
        'fix',
        'docs',
        'style',
        'refactor',
        'perf',
        'test',
        'build',
        'ci',
        'chore',
        'revert'
      ]
    ],
    'subject-case': [0],
    'header-max-length': [2, 'always', 100],
    'body-max-line-length': [0]
  },
  ignores: [
    (message) => /^Bump .+ from .+ to .+/.test(message),
    (message) => message.startsWith('Update ') && message.includes('.config.js'),
    (message) => message.startsWith('Merge branch '),
    (message) => message.startsWith('Merge ') && message.includes(' into '),
    // Git subtree commits
    (message) => message.startsWith("Merge commit '") && message.includes("' as '"),
    (message) => message.startsWith("Squashed '") && message.includes("' content from commit")
  ]
};
