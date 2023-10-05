// client.js
const socket = io();

let editor;

// Initialize the Monaco editor
require.config({ paths: { 'vs': 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.27.0/min/vs' } });
require(['vs/editor/editor.main'], function () {
  editor = monaco.editor.create(document.getElementById('editor'), {
    value: '',
    language: 'javascript',
    theme: 'vs-dark'
  });

  editor.onDidChangeModelContent(() => {
    const code = editor.getValue();
    socket.emit('code-update', code);
  });

  socket.on('receive-code', (code) => {
    editor.setValue(code);
  });
});

editor?.onDidChangeCursorPosition((event) => {
  const position = {
    lineNumber: event.position.lineNumber,
    column: event.position.column
  };
  socket.emit('cursor-position', position);
});

socket.on('receive-cursor-position', (position) => {
  editor.setPosition(position);
});
