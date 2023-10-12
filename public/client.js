const messageContainer = document.getElementById('messageContainer')
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

  editor.onDidChangeModelContent(() => {
    const code = editor.getValue();
    socket.emit('code-update', code);
  });

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
let lineCounter = 1;

function runCode() {
  const code = editor.getValue();
  displayConsoleMessage('Running code...');
  lineCounter = 1;
  const originalConsoleLog = console.log;
  let logOutput = '';

  console.log = (...args) => {
    const lineNumber = lineCounter++;
    logOutput += `${lineNumber}> ${args.map(arg => JSON.stringify(arg)).join(' ')}\n`;
  };

  try {
    eval(`(function() { ${code} })()`);
    if (logOutput.trim() !== '') {
      displayConsoleMessage('Code executed successfully. Console output:');
      displayConsoleMessage(logOutput);
    } else {
      displayConsoleMessage('Code executed successfully. No console output.');
    }
  } catch (error) {
    displayConsoleMessage('Error executing code: ' + error);
  } finally {
    console.log = originalConsoleLog;
  }
}

function clearConsole() {
  const consoleElement = document.getElementById('console');
  consoleElement.innerHTML = '';
}

function sendMessage() {
  const messageInput = document.getElementById('messageInput');
  const message = messageInput.value;
  console.log(message);
  socket.emit('chat-message', message);

  messageInput.value = '';
}

socket.on('receive-chat-message', (message) => {
  displayChatMessage(message);
});

function displayChatMessage(message) {
  const newMessageElement = document.createElement('div');
  newMessageElement.innerText = `<p><span>[User]:</span>${message}</p> `;
  messageContainer.appendChild(newMessageElement);
}
