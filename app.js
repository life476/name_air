const editor = document.getElementById('editor');
const fileNameInput = document.getElementById('fileName');
const fontSizeControl = document.getElementById('fontSize');
const fontSizeValue = document.getElementById('fontSizeValue');
const newBtn = document.getElementById('newBtn');
const openBtn = document.getElementById('openBtn');
const fileInput = document.getElementById('fileInput');
const downloadBtn = document.getElementById('downloadBtn');
const copyBtn = document.getElementById('copyBtn');
const toggleThemeBtn = document.getElementById('toggleThemeBtn');
const findInput = document.getElementById('findInput');
const replaceInput = document.getElementById('replaceInput');
const findNextBtn = document.getElementById('findNextBtn');
const replaceOneBtn = document.getElementById('replaceOneBtn');
const replaceAllBtn = document.getElementById('replaceAllBtn');
const searchStatus = document.getElementById('searchStatus');
const charCount = document.getElementById('charCount');
const wordCount = document.getElementById('wordCount');
const lineCount = document.getElementById('lineCount');
const cursorPos = document.getElementById('cursorPos');

const STORAGE_KEY = 'name_air_editor_content';
const NAME_KEY = 'name_air_editor_filename';
const FONT_SIZE_KEY = 'name_air_editor_font_size';
const THEME_KEY = 'name_air_editor_theme';

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function updateStats() {
  const text = editor.value;
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  charCount.textContent = `字符：${text.length}`;
  wordCount.textContent = `词数：${words}`;
  lineCount.textContent = `行数：${Math.max(1, text.split('\n').length)}`;
}

function updateCursorPosition() {
  const textBeforeCursor = editor.value.slice(0, editor.selectionStart);
  const lines = textBeforeCursor.split('\n');
  const row = lines.length;
  const col = lines[lines.length - 1].length + 1;
  cursorPos.textContent = `光标：${row}:${col}`;
}

function persist() {
  localStorage.setItem(STORAGE_KEY, editor.value);
  localStorage.setItem(NAME_KEY, fileNameInput.value.trim() || 'untitled.txt');
  localStorage.setItem(FONT_SIZE_KEY, fontSizeControl.value);
  localStorage.setItem(THEME_KEY, document.body.classList.contains('dark') ? 'dark' : 'light');
}

function applyFontSize(px) {
  editor.style.fontSize = `${px}px`;
  fontSizeValue.textContent = `${px}px`;
}

function ensureTxtExtension(name) {
  return name.toLowerCase().endsWith('.txt') ? name : `${name}.txt`;
}

function downloadContent() {
  const fileName = ensureTxtExtension(fileNameInput.value.trim() || 'untitled');
  const blob = new Blob([editor.value], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  URL.revokeObjectURL(url);
}

async function copyAll() {
  try {
    await navigator.clipboard.writeText(editor.value);
    copyBtn.textContent = '已复制';
    setTimeout(() => {
      copyBtn.textContent = '复制全部';
    }, 1200);
  } catch {
    copyBtn.textContent = '复制失败';
    setTimeout(() => {
      copyBtn.textContent = '复制全部';
    }, 1200);
  }
}

function setTheme(theme) {
  const dark = theme === 'dark';
  document.body.classList.toggle('dark', dark);
  toggleThemeBtn.textContent = dark ? '浅色模式' : '深色模式';
}

function loadFromStorage() {
  const cachedText = localStorage.getItem(STORAGE_KEY);
  const cachedName = localStorage.getItem(NAME_KEY);
  const cachedSize = localStorage.getItem(FONT_SIZE_KEY);
  const cachedTheme = localStorage.getItem(THEME_KEY);

  if (cachedText !== null) {
    editor.value = cachedText;
  }

  if (cachedName) {
    fileNameInput.value = cachedName;
  }

  if (cachedSize) {
    fontSizeControl.value = cachedSize;
  }

  setTheme(cachedTheme || 'light');
  applyFontSize(fontSizeControl.value);
  updateStats();
  updateCursorPosition();
}

function showSearchStatus(message) {
  searchStatus.textContent = message;
}

function findNext() {
  const keyword = findInput.value;
  if (!keyword) {
    showSearchStatus('请先输入查找内容');
    return;
  }

  const text = editor.value;
  const start = editor.selectionEnd;
  let index = text.indexOf(keyword, start);

  if (index === -1 && start > 0) {
    index = text.indexOf(keyword, 0);
  }

  if (index === -1) {
    showSearchStatus('未找到匹配内容');
    return;
  }

  editor.focus();
  editor.setSelectionRange(index, index + keyword.length);
  updateCursorPosition();
  showSearchStatus(`已定位到位置 ${index + 1}`);
}

function replaceCurrent() {
  const keyword = findInput.value;
  if (!keyword) {
    showSearchStatus('请先输入查找内容');
    return;
  }

  const selected = editor.value.slice(editor.selectionStart, editor.selectionEnd);
  if (selected !== keyword) {
    findNext();
    return;
  }

  const before = editor.value.slice(0, editor.selectionStart);
  const after = editor.value.slice(editor.selectionEnd);
  const replacement = replaceInput.value;
  const cursor = editor.selectionStart + replacement.length;
  editor.value = `${before}${replacement}${after}`;
  editor.setSelectionRange(cursor, cursor);
  updateStats();
  updateCursorPosition();
  persist();
  showSearchStatus('已替换当前匹配');
}

function replaceAll() {
  const keyword = findInput.value;
  if (!keyword) {
    showSearchStatus('请先输入查找内容');
    return;
  }

  const regex = new RegExp(escapeRegExp(keyword), 'g');
  const matches = editor.value.match(regex);
  const count = matches ? matches.length : 0;

  if (count === 0) {
    showSearchStatus('没有可替换的内容');
    return;
  }

  editor.value = editor.value.replace(regex, replaceInput.value);
  updateStats();
  updateCursorPosition();
  persist();
  showSearchStatus(`已替换 ${count} 处`);
}

function openTextFile(file) {
  if (!file) {
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    editor.value = String(reader.result || '');
    fileNameInput.value = ensureTxtExtension(file.name.replace(/\.txt$/i, ''));
    updateStats();
    updateCursorPosition();
    persist();
    showSearchStatus(`已打开：${file.name}`);
  };
  reader.readAsText(file, 'utf-8');
}

editor.addEventListener('input', () => {
  updateStats();
  updateCursorPosition();
  persist();
});

editor.addEventListener('click', updateCursorPosition);
editor.addEventListener('keyup', updateCursorPosition);

fileNameInput.addEventListener('input', persist);

fontSizeControl.addEventListener('input', () => {
  applyFontSize(fontSizeControl.value);
  persist();
});

newBtn.addEventListener('click', () => {
  if (editor.value && !confirm('确定清空当前内容并新建吗？')) {
    return;
  }

  editor.value = '';
  fileNameInput.value = 'untitled.txt';
  updateStats();
  updateCursorPosition();
  persist();
  showSearchStatus('已新建空白文件');
  editor.focus();
});

openBtn.addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', (event) => {
  const [file] = event.target.files;
  openTextFile(file);
  fileInput.value = '';
});

downloadBtn.addEventListener('click', downloadContent);
copyBtn.addEventListener('click', copyAll);

toggleThemeBtn.addEventListener('click', () => {
  const next = document.body.classList.contains('dark') ? 'light' : 'dark';
  setTheme(next);
  persist();
});

findNextBtn.addEventListener('click', findNext);
replaceOneBtn.addEventListener('click', replaceCurrent);
replaceAllBtn.addEventListener('click', replaceAll);

window.addEventListener('keydown', (event) => {
  const isMac = navigator.platform.toUpperCase().includes('MAC');
  const ctrlOrCmd = isMac ? event.metaKey : event.ctrlKey;

  if (ctrlOrCmd && event.key.toLowerCase() === 's') {
    event.preventDefault();
    downloadContent();
  }

  if (ctrlOrCmd && event.key.toLowerCase() === 'f') {
    event.preventDefault();
    findInput.focus();
  }
});

loadFromStorage();
