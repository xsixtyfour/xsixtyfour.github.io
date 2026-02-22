---
---
(function() {
  var saved = localStorage.getItem('theme');
  if (saved) {
    document.documentElement.setAttribute('data-theme', saved);
  }
})();

document.addEventListener('DOMContentLoaded', function() {
  var btn = document.querySelector('.theme-toggle');
  if (!btn) return;
  var current = document.documentElement.getAttribute('data-theme') || 'dark';
  btn.textContent = current === 'dark' ? '☀️' : '🌙';
  btn.addEventListener('click', function() {
    var html = document.documentElement;
    var cur = html.getAttribute('data-theme') || 'dark';
    var next = cur === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
    btn.textContent = next === 'dark' ? '☀️' : '🌙';
  });
});
document.addEventListener('DOMContentLoaded', function() {
  var scrollBtn = document.getElementById('scroll-top');
  if (!scrollBtn) return;
  window.addEventListener('scroll', function() {
    if (window.scrollY > 400) {
      scrollBtn.classList.add('visible');
    } else {
      scrollBtn.classList.remove('visible');
    }
  });
  scrollBtn.addEventListener('click', function() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
});
