const STORAGE_KEY = 'my-todo-list';
const THEME_KEY = 'my-todo-list-theme';

const form = document.getElementById('todo-form');
const input = document.getElementById('todo-input');
const list = document.getElementById('todo-list');
const emptyState = document.getElementById('empty-state');
const remainingCount = document.getElementById('remaining-count');
const filterButtons = document.querySelectorAll('.btn-filter');
const themeToggle = document.getElementById('theme-toggle');
const themeIcon = document.getElementById('theme-icon');
const themeLabel = document.getElementById('theme-label');
const colorScheme = window.matchMedia('(prefers-color-scheme: dark)');

// 從瀏覽器儲存空間載入待辦事項。
const savedTodos = localStorage.getItem(STORAGE_KEY);
let todos = savedTodos ? JSON.parse(savedTodos) : [];
let currentFilter = 'all';
let hasManualTheme = false;

// 儲存目前清單並更新頁面。
function saveAndRender() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  render();
}

// 依照目前篩選條件繪製清單，並更新整體未完成數量。
function render() {
  list.replaceChildren();

  const visibleTodos = todos.filter((todo) => {
    if (currentFilter === 'active') return !todo.completed;
    if (currentFilter === 'completed') return todo.completed;
    return true;
  });

  visibleTodos.forEach((todo) => {
    const item = document.createElement('li');
    item.className = todo.completed ? 'todo-item completed' : 'todo-item';
    item.dataset.id = todo.id;

    const checkbox = document.createElement('input');
    checkbox.className = 'todo-checkbox';
    checkbox.type = 'checkbox';
    checkbox.checked = todo.completed;
    checkbox.setAttribute('aria-label', `標記「${todo.text}」為完成`);

    const text = document.createElement('span');
    text.className = 'todo-text';
    text.textContent = todo.text;

    const deleteButton = document.createElement('button');
    deleteButton.className = 'btn-delete';
    deleteButton.type = 'button';
    deleteButton.textContent = '刪除';
    deleteButton.setAttribute('aria-label', `刪除「${todo.text}」`);

    item.append(checkbox, text, deleteButton);
    list.append(item);
  });

  emptyState.hidden = visibleTodos.length > 0;
  if (todos.length === 0) {
    emptyState.textContent = '還沒有任何待辦事項,新增一個吧!';
  } else if (currentFilter === 'active') {
    emptyState.textContent = '沒有未完成的待辦事項。';
  } else if (currentFilter === 'completed') {
    emptyState.textContent = '還沒有已完成的待辦事項。';
  }

  filterButtons.forEach((button) => {
    const isActive = button.dataset.filter === currentFilter;
    button.classList.toggle('is-active', isActive);
    button.setAttribute('aria-pressed', String(isActive));
  });

  remainingCount.textContent = `未完成:${todos.filter((todo) => !todo.completed).length} 項`;
}

// 更新主題按鈕文字與圖示。
function updateThemeButton(theme) {
  const isDark = theme === 'dark';
  themeIcon.textContent = isDark ? '☀️' : '🌙';
  themeLabel.textContent = isDark ? '淺色模式' : '深色模式';
  themeToggle.setAttribute('aria-pressed', String(isDark));
}

// 套用主題；只有使用者手動切換時才儲存選擇。
function applyTheme(theme, savePreference = false) {
  document.documentElement.dataset.theme = theme;
  updateThemeButton(theme);

  if (savePreference) {
    localStorage.setItem(THEME_KEY, theme);
    hasManualTheme = true;
  }
}

// 讀取儲存的主題，否則依照系統配色設定。
const savedTheme = localStorage.getItem(THEME_KEY);
if (savedTheme === 'light' || savedTheme === 'dark') {
  hasManualTheme = true;
  applyTheme(savedTheme);
} else {
  applyTheme(colorScheme.matches ? 'dark' : 'light');
}

colorScheme.addEventListener('change', (event) => {
  if (!hasManualTheme) {
    applyTheme(event.matches ? 'dark' : 'light');
  }
});

themeToggle.addEventListener('click', () => {
  const nextTheme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
  applyTheme(nextTheme, true);
});

// 切換目前的篩選條件。
filterButtons.forEach((button) => {
  button.addEventListener('click', () => {
    currentFilter = button.dataset.filter;
    render();
  });
});

// 表單送出時新增非空白待辦事項。
form.addEventListener('submit', (event) => {
  event.preventDefault();

  const text = input.value.trim();
  if (!text) return;

  todos.push({
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    text,
    completed: false,
  });
  input.value = '';
  saveAndRender();
  input.focus();
});

// 以事件委派處理待辦事項的刪除操作。
list.addEventListener('click', (event) => {
  const item = event.target.closest('.todo-item');
  if (!item) return;

  if (event.target.matches('.btn-delete')) {
    todos = todos.filter((entry) => entry.id !== item.dataset.id);
    saveAndRender();
  }
});

// 以事件委派處理完成狀態變更。
list.addEventListener('change', (event) => {
  if (event.target.matches('.todo-checkbox')) {
    const item = event.target.closest('.todo-item');
    const todo = todos.find((entry) => entry.id === item.dataset.id);
    if (!todo) return;

    todo.completed = event.target.checked;
    saveAndRender();
  }
});

render();
