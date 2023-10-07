const socket = io();
let editor;

require.config({
  paths: { 'vs': 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.27.0/min/vs' }
});

require(['vs/editor/editor.main'], function () {
  editor = monaco.editor.create(document.getElementById('editor'), {
    value: '',
    language: 'javascript',
    theme: 'vs-dark'
  });

  // Event listener for editor content changes
  editor.onDidChangeModelContent(() => {
    const code = editor.getValue();
    socket.emit('code-update', code);
  });

  // Event listener for cursor position changes
  editor.onDidChangeCursorPosition(event => {
    const position = {
      lineNumber: event.position.lineNumber,
      column: event.position.column
    };
    socket.emit('cursor-position', position);
  });

  socket.on('receive-code', (code) => {
    editor.setValue(code);
  });

  socket.on('receive-cursor-position', (position) => {
    editor.setPosition(position);
  });

  // Event listener for console messages
  socket.on('console-message', (message) => {
    displayConsoleMessage(message);
  });
});

function displayConsoleMessage(message) {
  const consoleElement = document.getElementById('console');
  const newMessageElement = document.createElement('div');
  newMessageElement.innerText = message;
  consoleElement.appendChild(newMessageElement);
}

// Function to log messages to the console
function logToConsole(message) {
  socket.emit('console-message', message);
}
