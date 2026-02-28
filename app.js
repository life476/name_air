const editor = document.getElementById('editor');
const highlightPane = document.getElementById('highlightPane');
const highlightCode = document.getElementById('highlightCode');
const languageSelect = document.getElementById('languageSelect');
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
const LANGUAGE_KEY = 'name_air_editor_language';

const KEYWORDS = {
  c: ['auto', 'break', 'case', 'char', 'const', 'continue', 'default', 'do', 'double', 'else', 'enum', 'extern', 'float', 'for', 'goto', 'if', 'int', 'long', 'register', 'return', 'short', 'signed', 'sizeof', 'static', 'struct', 'switch', 'typedef', 'union', 'unsigned', 'void', 'volatile', 'while'],
  cpp: ['alignas', 'alignof', 'auto', 'bool', 'break', 'case', 'catch', 'char', 'class', 'const', 'constexpr', 'continue', 'default', 'delete', 'do', 'double', 'else', 'enum', 'explicit', 'export', 'extern', 'false', 'float', 'for', 'friend', 'if', 'inline', 'int', 'long', 'mutable', 'namespace', 'new', 'noexcept', 'nullptr', 'operator', 'private', 'protected', 'public', 'return', 'short', 'signed', 'sizeof', 'static', 'struct', 'switch', 'template', 'this', 'throw', 'true', 'try', 'typedef', 'typename', 'union', 'unsigned', 'using', 'virtual', 'void', 'volatile', 'while'],
  csharp: ['abstract', 'as', 'base', 'bool', 'break', 'byte', 'case', 'catch', 'char', 'checked', 'class', 'const', 'continue', 'decimal', 'default', 'delegate', 'do', 'double', 'else', 'enum', 'event', 'explicit', 'extern', 'false', 'finally', 'fixed', 'float', 'for', 'foreach', 'if', 'implicit', 'in', 'int', 'interface', 'internal', 'is', 'lock', 'long', 'namespace', 'new', 'null', 'object', 'operator', 'out', 'override', 'private', 'protected', 'public', 'readonly', 'ref', 'return', 'sbyte', 'sealed', 'short', 'sizeof', 'stackalloc', 'static', 'string', 'struct', 'switch', 'this', 'throw', 'true', 'try', 'typeof', 'uint', 'ulong', 'unchecked', 'unsafe', 'ushort', 'using', 'virtual', 'void', 'volatile', 'while'],
  python: ['and', 'as', 'assert', 'async', 'await', 'break', 'class', 'continue', 'def', 'del', 'elif', 'else', 'except', 'False', 'finally', 'for', 'from', 'global', 'if', 'import', 'in', 'is', 'lambda', 'None', 'nonlocal', 'not', 'or', 'pass', 'raise', 'return', 'True', 'try', 'while', 'with', 'yield'],
  javascript: ['await', 'break', 'case', 'catch', 'class', 'const', 'continue', 'debugger', 'default', 'delete', 'do', 'else', 'enum', 'export', 'extends', 'false', 'finally', 'for', 'function', 'if', 'import', 'in', 'instanceof', 'let', 'new', 'null', 'return', 'super', 'switch', 'this', 'throw', 'true', 'try', 'typeof', 'var', 'void', 'while', 'yield'],
};

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function escapeHtml(value) {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function highlightCodeText(text, language) {
  if (language === 'markup') {
    const escaped = escapeHtml(text);
    return escaped
      .replace(/(&lt;\/?)([a-zA-Z][\w:-]*)(.*?)(\/??&gt;)/g, '$1<span class="token keyword">$2</span>$3$4')
      .replace(/([a-zA-Z-:]+)(=)("[^"]*"|'[^']*')/g, '<span class="token attr">$1</span>$2<span class="token string">$3</span>');
  }

  if (language === 'css') {
    const escaped = escapeHtml(text);
    return escaped
      .replace(/(\/\*[\s\S]*?\*\/)/g, '<span class="token comment">$1</span>')
      .replace(/([.#]?[a-zA-Z][\w-]*)(\s*\{)/g, '<span class="token keyword">$1</span>$2')
      .replace(/([a-zA-Z-]+)(\s*:)/g, '<span class="token attr">$1</span>$2')
      .replace(/("[^"]*"|'[^']*')/g, '<span class="token string">$1</span>')
      .replace(/\b(\d+(?:\.\d+)?(?:px|em|rem|%|vh|vw)?)\b/g, '<span class="token number">$1</span>');
  }

  const placeholders = [];
  const store = (matched, cls) => {
    const id = placeholders.length;
    placeholders.push(`<span class="token ${cls}">${escapeHtml(matched)}</span>`);
    return `@@TOKEN_${id}@@`;
  };

  let processed = text;
  if (language === 'python') {
    processed = processed.replace(/#.*$/gm, (m) => store(m, 'comment'));
  } else {
    processed = processed.replace(/\/\*[\s\S]*?\*\//g, (m) => store(m, 'comment'));
    processed = processed.replace(/\/\/.*$/gm, (m) => store(m, 'comment'));
  }

  processed = processed.replace(/`(?:\\.|[^`\\])*`|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'/g, (m) => store(m, 'string'));
  processed = escapeHtml(processed);

  const keywords = KEYWORDS[language] || KEYWORDS.javascript;
  const keywordRegex = new RegExp(`\\b(${keywords.map(escapeRegExp).join('|')})\\b`, 'g');
  processed = processed.replace(keywordRegex, '<span class="token keyword">$1</span>');
  processed = processed.replace(/\b(\d+(?:\.\d+)?)\b/g, '<span class="token number">$1</span>');

  return processed.replace(/@@TOKEN_(\d+)@@/g, (_, id) => placeholders[Number(id)]);
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

function syncScroll() {
  highlightPane.scrollTop = editor.scrollTop;
  highlightPane.scrollLeft = editor.scrollLeft;
}

function syncHighlight() {
  highlightCode.innerHTML = `${highlightCodeText(editor.value, languageSelect.value)}\n`;
}

function persist() {
  localStorage.setItem(STORAGE_KEY, editor.value);
  localStorage.setItem(NAME_KEY, fileNameInput.value.trim() || 'untitled.txt');
  localStorage.setItem(FONT_SIZE_KEY, fontSizeControl.value);
  localStorage.setItem(THEME_KEY, document.body.classList.contains('dark') ? 'dark' : 'light');
  localStorage.setItem(LANGUAGE_KEY, languageSelect.value);
}

function applyFontSize(px) {
  editor.style.fontSize = `${px}px`;
  highlightPane.style.fontSize = `${px}px`;
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
  const cachedLanguage = localStorage.getItem(LANGUAGE_KEY);

  if (cachedText !== null) {
    editor.value = cachedText;
  }

  if (cachedName) {
    fileNameInput.value = cachedName;
  }

  if (cachedSize) {
    fontSizeControl.value = cachedSize;
  }

  if (cachedLanguage) {
    languageSelect.value = cachedLanguage;
  }

  setTheme(cachedTheme || 'light');
  applyFontSize(fontSizeControl.value);
  syncHighlight();
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
  syncHighlight();
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
  syncHighlight();
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
    syncHighlight();
    updateStats();
    updateCursorPosition();
    persist();
    showSearchStatus(`已打开：${file.name}`);
  };
  reader.readAsText(file, 'utf-8');
}

editor.addEventListener('input', () => {
  syncHighlight();
  updateStats();
  updateCursorPosition();
  persist();
});

editor.addEventListener('scroll', syncScroll);
editor.addEventListener('click', updateCursorPosition);
editor.addEventListener('keyup', updateCursorPosition);

editor.addEventListener('keydown', (event) => {
  if (event.key === 'Tab') {
    event.preventDefault();
    const start = editor.selectionStart;
    const end = editor.selectionEnd;
    editor.value = `${editor.value.slice(0, start)}  ${editor.value.slice(end)}`;
    editor.setSelectionRange(start + 2, start + 2);
    syncHighlight();
    updateStats();
    updateCursorPosition();
    persist();
  }
});

fileNameInput.addEventListener('input', persist);

fontSizeControl.addEventListener('input', () => {
  applyFontSize(fontSizeControl.value);
  persist();
});

languageSelect.addEventListener('change', () => {
  syncHighlight();
  persist();
});

newBtn.addEventListener('click', () => {
  if (editor.value && !confirm('确定清空当前内容并新建吗？')) {
    return;
  }

  editor.value = '';
  fileNameInput.value = 'untitled.txt';
  syncHighlight();
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
