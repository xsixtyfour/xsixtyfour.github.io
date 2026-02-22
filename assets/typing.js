document.addEventListener('DOMContentLoaded', function () {
  var el = document.getElementById('typing-text');
  if (!el) return;
  var text = el.getAttribute('data-text');
  el.textContent = '';
  el.style.visibility = 'visible';
  var i = 0;
  function type() {
    if (i < text.length) {
      el.textContent += text.charAt(i);
      i++;
      setTimeout(type, 20);
    }
  }
  type();
});
