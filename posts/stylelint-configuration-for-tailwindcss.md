---
date: 2021-03-15
title: Stylelint Configuration for use with Tailwind CSS
tags: ['tailwind', 'css', 'notes']
is_private: false
---

When using Tailwind CSS in a Toast project I got a CSS warning
`semi-colon expected css(css-semicolonexpected)` when trying to use
the Tailwind `@apply` directive.

A quick Google gave me a stackoverflow result for using it in Vue but
the solution worked the same in Toast with one last configuration
needed.

Add stylelint dependencies:

```bash
npm install --save-dev stylelint stylelint-config-standard
```

Create a stylelint config in `stylelint.config.js` in the root of the
project:

```js
module.exports = {
  extends: ['stylelint-config-standard'],
  rules: {
    'at-rule-no-unknown': [
      true,
      {
        ignoreAtRules: [
          'tailwind',
          'apply',
          'variants',
          'responsive',
          'screen',
        ],
      },
    ],
    'declaration-block-trailing-semicolon': null,
    'no-descending-specificity': null,
  },
}
```

Install VS Code extensions:

- [stylelint]
- [Tailwind CSS IntelliSense]

Add the following to a VS Code settings file:

```json
"css.validate": false,
"less.validate": false,
"scss.validate": false,
```

If there's not a file already add it with:

```bash
mkdir .vscode
touch .vscode/settings.json
```

## Note using in Toast

<!-- cSpell:ignore stylelintrc -->

With styling and using [stylelint] in Toast, rather than use the
recommended `stylelint.config.js` use `.stylelintrc` and add in the
configuration as a JSON object or add it directly to the
`package.json` file.

```json
{
  "name": "project-using-stylelint",
  "scripts": {},
  "dependencies": {},
  "devDependencies": {},
  "stylelint": {
    "extends": ["stylelint-config-standard"],
    "rules": {
      "at-rule-no-unknown": [
        true,
        {
          "ignoreAtRules": [
            "tailwind",
            "apply",
            "variants",
            "responsive",
            "screen"
          ]
        }
      ],
      "declaration-block-trailing-semicolon": null,
      "no-descending-specificity": null
    }
  }
}
```

With the `module.exports` syntax Toast will derp, see the SO question
for configuration: [How to solve semi-colon expected
css(css-semicolonexpected)]

[stylelint]: https://stylelint.io/
[how to solve semi-colon expected css(css-semicolonexpected)]:
  https://stackoverflow.com/a/63784195/1138354
[stylelint]:
  https://marketplace.visualstudio.com/items?itemName=stylelint.vscode-stylelint
[tailwind css intellisense]:
  https://marketplace.visualstudio.com/items?itemName=bradlc.vscode-tailwindcss
