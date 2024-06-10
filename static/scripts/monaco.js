import * as monaco from 'https://cdn.jsdelivr.net/npm/monaco-editor@0.49.0/+esm';

window.monaco = monaco;

monaco.languages.register({ id: 'elsa' });
monaco.languages.setMonarchTokensProvider('elsa', elsaDef);
monaco.editor.defineTheme('elsa-default', {
    base: 'vs',
    inherit: true,
    rules: [
      {
        token: "operator",
        foreground: "#46691b"
      },
      {
        token: "brackets",
        foreground: "#cf5300"
      },
      {
        token: "constructor",
        foreground: "#b723ac",
      }
    ],
    colors: {}
    });

monaco.editor.setTheme('elsa-default');

window.editor = monaco.editor.create(document.querySelector('.editor'), {
    language: 'elsa',
    automaticLayout: true,
});

