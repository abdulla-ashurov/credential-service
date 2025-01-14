module.exports = {
	rules: {
		'type-case': [2, 'always', 'lower-case'],
		'type-empty': [2, 'never'],
		'type-enum': [
			2,
			'always',
			['build', 'chore', 'ci', 'docs', 'feat', 'fix', 'perf', 'refactor', 'revert', 'style', 'test'],
		],
		'scope-case': [2, 'always', 'lower-case'],
		'scope-empty': [1, 'never'],
		'subject-case': [2, 'always', ['sentence-case']],
		'subject-empty': [1, 'never'],
		'subject-full-stop': [1, 'never', '.'],
		'header-max-length': [2, 'always', 100],
		'body-leading-blank': [1, 'always'],
		'body-max-line-length': [2, 'always', 1000],
		'footer-leading-blank': [1, 'always'],
		'footer-max-line-length': [2, 'always', 100],
	},
};
