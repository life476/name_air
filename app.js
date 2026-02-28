const editor = document.getElementById('editor');
const fileNameInput = document.getElementById('fileName');
const fontSizeControl = document.getElementById('fontSize');
const fontSizeValue = document.getElementById('fontSizeValue');
const newBtn = document.getElementById('newBtn');
const downloadBtn = document.getElementById('downloadBtn');
const copyBtn = document.getElementById('copyBtn');
const charCount = document.getElementById('charCount');
const lineCount = document.getElementById('lineCount');

const STORAGE_KEY = 'name_air_editor_content';
const NAME_KEY = 'name_air_editor_filename';
const FONT_SIZE_KEY = 'name_air_editor_font_size';

function updateStats() {
  const text = editor.value;
  charCount.textContent = `字符：${text.length}`;
  lineCount.textContent = `行数：${Math.max(1, text.split('\n').length)}`;
}

function persist() {
  localStorage.setItem(STORAGE_KEY, editor.value);
  localStorage.setItem(NAME_KEY, fileNameInput.value.trim() || 'untitled.txt');
  localStorage.setItem(FONT_SIZE_KEY, fontSizeControl.value);
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

function loadFromStorage() {
  const cachedText = localStorage.getItem(STORAGE_KEY);
  const cachedName = localStorage.getItem(NAME_KEY);
  const cachedSize = localStorage.getItem(FONT_SIZE_KEY);

  if (cachedText !== null) {
    editor.value = cachedText;
  }

  if (cachedName) {
    fileNameInput.value = cachedName;
  }

  if (cachedSize) {
    fontSizeControl.value = cachedSize;
  }

  applyFontSize(fontSizeControl.value);
  updateStats();
}

editor.addEventListener('input', () => {
  updateStats();
  persist();
});

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
  persist();
  editor.focus();
});

downloadBtn.addEventListener('click', downloadContent);
copyBtn.addEventListener('click', copyAll);

loadFromStorage();
