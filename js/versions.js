(function () {
  'use strict';

  const pages = ['index.html', 'version-2.html', 'version-3.html'];
  const currentFile = location.pathname.split('/').pop() || 'index.html';
  const current = Math.max(0, pages.indexOf(currentFile));
  const labels = ['Классика', 'Айдентика', 'Премиум'];

  const bar = document.createElement('nav');
  bar.className = 'version-bar';
  bar.setAttribute('aria-label', 'Сравнение версий сайта');
  bar.innerHTML = '<div class="version-bar-inner">' +
    '<div class="version-bar-label"><span class="version-bar-mark">03</span><span class="version-bar-title">Концепции сайта</span><span class="version-bar-note">один контент · три дизайна</span></div>' +
    '<div class="version-tabs">' + labels.map((label, i) =>
      '<a class="version-tab" href="' + pages[i] + '" data-version="' + i + '"' + (i === current ? ' aria-current="page"' : '') + '>' +
      '<span class="version-tab-num">0' + (i + 1) + '</span><span>' + label + '</span></a>'
    ).join('') + '</div>' +
    '<span class="version-bar-help">Быстрое переключение <kbd>1</kbd><kbd>2</kbd><kbd>3</kbd></span>' +
    '</div>';
  document.body.prepend(bar);

  function currentSection() {
    const sections = Array.from(document.querySelectorAll('main section[id]'));
    if (!sections.length || window.scrollY < 160) return 'main';
    const header = document.getElementById('siteHeader');
    const threshold = window.scrollY + (header ? header.getBoundingClientRect().bottom : 130) + 32;
    let active = sections[0];
    sections.forEach((section) => {
      if (section.offsetTop <= threshold) active = section;
    });
    return active.id;
  }

  function go(index) {
    if (index === current) {
      const target = document.getElementById(currentSection());
      if (target) target.scrollIntoView({ behavior: 'smooth' });
      return;
    }
    location.href = pages[index] + '#' + currentSection();
  }

  bar.addEventListener('click', (event) => {
    const link = event.target.closest('[data-version]');
    if (!link || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    go(Number(link.dataset.version));
  });

  document.addEventListener('keydown', (event) => {
    if (event.ctrlKey || event.metaKey || event.altKey || event.repeat) return;
    if (event.target.closest('input, textarea, select, [contenteditable="true"], dialog')) return;
    const index = Number(event.key) - 1;
    if (index >= 0 && index < pages.length) {
      event.preventDefault();
      go(index);
    }
  });

  if (location.hash) {
    const target = document.getElementById(location.hash.slice(1));
    if (target) {
      requestAnimationFrame(() => target.scrollIntoView({ behavior: 'instant', block: 'start' }));
      if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(() => target.scrollIntoView({ behavior: 'instant', block: 'start' }));
      }
    }
  }
})();
