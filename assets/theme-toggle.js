---
---
(function() {
  var saved = localStorage.getItem('theme');
  if (saved) {
    document.documentElement.setAttribute('data-theme', saved);
  }
})();

function toggleTheme() {
  var html = document.documentElement;
  var current = html.getAttribute('data-theme') || 'dark';
  var next = current === 'dark' ? 'light' : 'dark';
  html.setAttribute('data-theme', next);
  localStorage.setItem('theme', next);
  var btn = document.querySelector('.theme-toggle');
  if (btn) {
    btn.textContent = next === 'dark' ? '☀️' : '🌙';
  }
}

document.addEventListener('DOMContentLoaded', function() {
  var btn = document.querySelector('.theme-toggle');
  if (btn) {
    var current = document.documentElement.getAttribute('data-theme') || 'dark';
    btn.textContent = current === 'dark' ? '☀️' : '🌙';
  }
});
