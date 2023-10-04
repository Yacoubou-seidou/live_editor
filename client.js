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

  // Listen for changes in the editor content and send updates to the server
  editor.onDidChangeModelContent(() => {
    const code = editor.getValue();
    socket.emit('code-update', code);
  });

  // Listen for updates from the server and update the editor content
  socket.on('receive-code', (code) => {
    editor.setValue(code);
  });
});

// Listen for cursor position changes and send updates to the server
editor.onDidChangeCursorPosition((event) => {
  const position = {
    lineNumber: event.position.lineNumber,
    column: event.position.column
  };
  socket.emit('cursor-position', position);
});

// Listen for cursor position updates from the server and update the editor
socket.on('receive-cursor-position', (position) => {
  editor.setPosition(position);
});
