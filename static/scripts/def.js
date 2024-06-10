const elsaDef = {
  keywords: ['let', 'eval'],
  constructors: /(\\|->)+/,
  symbols:  /[=><!~?:&|+\-*\/\^%\\]+/,
  evalOperators: /(=[a|b|d|*|~]>)+/,
  tokenizer: {
    root: [
      [/[a-z_$][\w$]*/, { cases: { '@keywords': 'keyword',
                                   '@default': 'identifier' } }],
      [/[A-Z][\w\$]*/, 'type.identifier' ],
      { include: '@whitespace' },
      [/[()]/, 'brackets'],
      [/@evalOperators/, 'operator'],
      [/@constructors/, 'constructor'],
    ],
    whitespace: [
      [/--.*$/, 'comment'],
    ],
  },
}
