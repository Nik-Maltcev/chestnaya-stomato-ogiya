/* ============================================================
   Честная стоматология — main.js
   ============================================================ */
(function () {
  'use strict';

  const $ = (sel, ctx) => (ctx || document).querySelector(sel);
  const $$ = (sel, ctx) => Array.from((ctx || document).querySelectorAll(sel));
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fmt = (n) => Math.round(n).toLocaleString('ru-RU');

  /* ---------- Toasts ---------- */
  const toastsBox = $('#toasts');
  function toast(message, type) {
    const el = document.createElement('div');
    el.className = 'toast' + (type === 'success' ? ' success' : '');
    el.innerHTML = '<svg class="icon"><use href="#' + (type === 'success' ? 'i-check-circle' : 'i-info') + '"/></svg><span></span>';
    el.lastElementChild.textContent = message;
    toastsBox.appendChild(el);
    setTimeout(() => {
      el.classList.add('leaving');
      el.addEventListener('animationend', () => el.remove(), { once: true });
    }, 3800);
  }

  /* ---------- Header: scroll state, progress, parallax, to-top ---------- */
  const header = $('#siteHeader');
  const progress = $('#scrollProgress');
  const toTop = $('#toTop');
  const mobileCta = $('#mobileCta');
  const parallaxEls = $$('[data-parallax]');
  let contactsVisible = false;
  let footerVisible = false;
  let ticking = false;

  function onScroll() {
    const y = window.scrollY;
    header.classList.toggle('is-scrolled', y > 24);
    const max = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.width = (max > 0 ? (y / max) * 100 : 0) + '%';
    toTop.classList.toggle('is-visible', y > 700);
    mobileCta.classList.toggle('is-visible', y > 480 && !contactsVisible && !footerVisible);
    if (!reduceMotion && y < window.innerHeight * 1.2) {
      parallaxEls.forEach((el) => {
        const f = parseFloat(el.dataset.parallax) || 0;
        el.style.transform = 'translateY(' + (y * f).toFixed(1) + 'px)';
      });
    }
    ticking = false;
  }
  window.addEventListener('scroll', () => {
    if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
  }, { passive: true });
  onScroll();

  toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' }));

  const hideCtaObserver = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.target.id === 'contacts') contactsVisible = e.isIntersecting;
      if (e.target.classList.contains('site-footer')) footerVisible = e.isIntersecting;
    });
    onScroll();
  }, { threshold: 0.08 });
  hideCtaObserver.observe($('#contacts'));
  hideCtaObserver.observe($('.site-footer'));

  /* ---------- Scrollspy ---------- */
  const navLinks = $$('.nav-link');
  const spyObserver = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      const id = e.target.id;
      navLinks.forEach((l) => l.classList.toggle('is-active', l.dataset.section === id));
    });
  }, { rootMargin: '-40% 0px -55% 0px' });
  $$('[data-spy]').forEach((s) => spyObserver.observe(s));

  /* ---------- Mobile menu ---------- */
  const burger = $('#burger');
  const menu = $('#mobileMenu');
  const overlay = $('#menuOverlay');
  const menuClose = $('#menuClose');
  let menuOpen = false;

  function setMenu(open) {
    menuOpen = open;
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
    menu.setAttribute('aria-hidden', String(!open));
    document.body.classList.toggle('menu-open', open);
    if (open) {
      overlay.hidden = false;
      requestAnimationFrame(() => { overlay.classList.add('is-open'); menu.classList.add('is-open'); });
      menuClose.focus();
    } else {
      overlay.classList.remove('is-open');
      menu.classList.remove('is-open');
      setTimeout(() => { if (!menuOpen) overlay.hidden = true; }, 380);
      burger.focus();
    }
  }
  burger.addEventListener('click', () => setMenu(!menuOpen));
  menuClose.addEventListener('click', () => setMenu(false));
  overlay.addEventListener('click', () => setMenu(false));
  menu.addEventListener('click', (e) => { if (e.target.closest('a[href^="#"]')) setMenu(false); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && menuOpen) setMenu(false); });

  /* ---------- Reveal on scroll ---------- */
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add('is-visible'); revealObserver.unobserve(e.target); }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
  $$('.reveal').forEach((el) => revealObserver.observe(el));

  /* ---------- Animated counters ---------- */
  function animateCount(el) {
    const target = parseFloat(el.dataset.count);
    const decimals = parseInt(el.dataset.decimals || '0', 10);
    const render = (v) => { el.textContent = decimals ? v.toFixed(decimals).replace('.', ',') : fmt(v); };
    if (reduceMotion) { render(target); return; }
    const start = performance.now();
    const dur = 1400;
    (function tick(now) {
      const p = Math.min((now - start) / dur, 1);
      render(target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(tick);
    })(start);
  }
  const countObserver = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) { animateCount(e.target); countObserver.unobserve(e.target); }
    });
  }, { threshold: 0.5 });
  $$('[data-count]').forEach((el) => countObserver.observe(el));

  /* ---------- Service filters ---------- */
  const filterBtns = $$('.filter-btn');
  const serviceCards = $$('.service-card');
  filterBtns.forEach((btn) => {
    btn.setAttribute('aria-pressed', String(btn.classList.contains('is-active')));
    btn.addEventListener('click', () => {
      filterBtns.forEach((b) => {
        b.classList.toggle('is-active', b === btn);
        b.setAttribute('aria-pressed', String(b === btn));
      });
      const cat = btn.dataset.filter;
      serviceCards.forEach((card) => {
        const show = cat === 'all' || card.dataset.cat === cat;
        card.classList.toggle('is-hidden', !show);
        card.classList.remove('animate-in');
        if (show) { void card.offsetWidth; card.classList.add('animate-in'); }
      });
    });
  });

  /* ---------- Calculator ---------- */
  const calcItems = $$('.calc-item');
  const calcTotalEl = $('#calcTotal');
  const calcCountEl = $('#calcCount');
  let displayedTotal = 3500;
  let totalRaf = null;

  function plural(n, one, few, many) {
    const m10 = n % 10, m100 = n % 100;
    if (m10 === 1 && m100 !== 11) return one;
    if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return few;
    return many;
  }

  function calcState() {
    return calcItems.map((item) => {
      const checked = $('.calc-check', item).checked;
      const qty = parseInt(item.dataset.qty || '1', 10);
      const price = parseInt(item.dataset.price, 10);
      return {
        key: item.dataset.key,
        name: $('.calc-name', item).textContent.trim(),
        checked, qty, price,
        sum: checked ? price * qty : 0
      };
    });
  }

  function renderTotal(animate) {
    const state = calcState();
    const total = state.reduce((s, i) => s + i.sum, 0);
    const count = state.filter((i) => i.checked).length;
    calcCountEl.textContent = '· ' + count + ' ' + plural(count, 'позиция', 'позиции', 'позиций');
    if (totalRaf) cancelAnimationFrame(totalRaf);
    if (!animate || reduceMotion) {
      displayedTotal = total;
      calcTotalEl.textContent = fmt(total) + ' ₽';
    } else {
      const from = displayedTotal;
      const start = performance.now();
      const step = (now) => {
        const p = Math.min((now - start) / 420, 1);
        const v = from + (total - from) * (1 - Math.pow(1 - p, 3));
        calcTotalEl.textContent = fmt(v) + ' ₽';
        if (p < 1) totalRaf = requestAnimationFrame(step);
        else displayedTotal = total;
      };
      totalRaf = requestAnimationFrame(step);
    }
    calcTotalEl.classList.add('bump');
    setTimeout(() => calcTotalEl.classList.remove('bump'), 180);
  }

  function syncItem(item) {
    const checked = $('.calc-check', item).checked;
    item.classList.toggle('is-on', checked);
    $$('.step-btn', item).forEach((b) => { b.disabled = !checked; });
  }

  calcItems.forEach((item) => {
    syncItem(item);
    $('.calc-check', item).addEventListener('change', () => { syncItem(item); renderTotal(true); });
    $$('.step-btn', item).forEach((btn) => {
      btn.addEventListener('click', () => {
        const max = parseInt(item.dataset.max || '1', 10);
        let qty = parseInt(item.dataset.qty || '1', 10) + parseInt(btn.dataset.step, 10);
        qty = Math.max(1, Math.min(max, qty));
        item.dataset.qty = String(qty);
        $('.step-value', item).textContent = String(qty);
        renderTotal(true);
      });
    });
  });
  renderTotal(false);

  function smetaText() {
    const state = calcState().filter((i) => i.checked);
    const total = state.reduce((s, i) => s + i.sum, 0);
    const lines = state.map((i) => '• ' + i.name + (i.qty > 1 ? ' × ' + i.qty : '') + ' — ' + fmt(i.sum) + ' ₽');
    return [
      'ЧЕСТНАЯ СТОМАТОЛОГИЯ — ПРЕДВАРИТЕЛЬНАЯ СМЕТА',
      'Дата расчета: ' + new Date().toLocaleDateString('ru-RU'),
      '----------------------------------------',
      'Первичный осмотр и план лечения — 0 ₽',
      ...lines,
      '----------------------------------------',
      'ИТОГО: ' + fmt(total) + ' ₽',
      '',
      'Точная смета составляется врачом на консультации',
      'и фиксируется в договоре. План действует 30 дней.',
      'Если лечение окажется сложнее — разницу оплачивает клиника.',
      '',
      'Москва, ул. Клиническая, 14к2 · +7 (495) 890-44-22'
    ].join('\n');
  }

  $('#calcDownload').addEventListener('click', () => {
    const blob = new Blob(['\ufeff' + smetaText()], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'smeta-chestnaya-stomatologiya.txt';
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
    toast('Смета скачана текстовым файлом', 'success');
  });

  /* ---------- Booking form ---------- */
  const form = $('#appointmentForm');
  const successBox = $('#formSuccess');
  const submitBtn = $('#submitBtn');
  const fDirection = $('#f-direction');
  const fDoctor = $('#f-doctor');
  const fDate = $('#f-date');
  const fTime = $('#f-time');
  const fName = $('#f-name');
  const fPhone = $('#f-phone');
  const fComment = $('#f-comment');
  const fConsent = $('#f-consent');
  const formWrap = $('.booking-form-wrap');

  const today = new Date();
  const tomorrow = new Date(today.getTime() + 86400000);
  const iso = (d) => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  fDate.min = iso(today);
  fDate.value = iso(tomorrow);

  function goToBooking(opts) {
    opts = opts || {};
    if (menuOpen) setMenu(false);
    if (opts.direction) fDirection.value = opts.direction;
    if (opts.doctor) fDoctor.value = opts.doctor;
    if (opts.comment) fComment.value = opts.comment;
    if (!successBox.hidden) resetBooking();
    $('#contacts').scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
    formWrap.animate(
      [{ boxShadow: '0 0 0 0 rgba(65,190,253,.65)' }, { boxShadow: '0 0 0 16px rgba(65,190,253,0)' }],
      { duration: 900, iterations: 2, easing: 'ease-out' }
    );
    if (opts.toast) toast(opts.toast);
  }

  $$('[data-service]').forEach((btn) => {
    btn.addEventListener('click', () => {
      goToBooking({ direction: btn.dataset.service, toast: 'Направление подставлено в форму записи' });
    });
  });
  $$('[data-doctor]').forEach((btn) => {
    btn.addEventListener('click', () => {
      goToBooking({ doctor: btn.dataset.doctor, toast: 'Врач выбран — осталось указать дату и телефон' });
    });
  });

  $('#calcFix').addEventListener('click', () => {
    const state = calcState().filter((i) => i.checked);
    const total = state.reduce((s, i) => s + i.sum, 0);
    let direction = 'consult';
    if (state.some((i) => i.key === 'implant')) direction = 'implant';
    else if (state.some((i) => i.key === 'veneer')) direction = 'veneers';
    else if (state.some((i) => i.key === 'caries')) direction = 'therapy';
    else if (state.some((i) => i.key === 'hygiene')) direction = 'hygiene';
    const comment = 'Предварительная смета: ' + state.map((i) => i.name + (i.qty > 1 ? ' ×' + i.qty : '')).join(', ') + '. Итого: ' + fmt(total) + ' ₽.';
    goToBooking({ direction, comment, toast: 'Смета перенесена в форму — зафиксируем её в договоре' });
  });

  /* Phone mask */
  function maskPhone(raw) {
    let d = raw.replace(/\D/g, '');
    if (d.startsWith('8')) d = '7' + d.slice(1);
    if (d && !d.startsWith('7')) d = '7' + d;
    d = d.slice(0, 11);
    if (!d) return '';
    let out = '+7';
    if (d.length > 1) out += ' (' + d.slice(1, 4);
    if (d.length >= 4) out += ')';
    if (d.length > 4) out += ' ' + d.slice(4, 7);
    if (d.length > 7) out += '-' + d.slice(7, 9);
    if (d.length > 9) out += '-' + d.slice(9, 11);
    return out;
  }
  fPhone.addEventListener('focus', () => { if (!fPhone.value) fPhone.value = '+7 ('; });
  fPhone.addEventListener('input', () => { fPhone.value = maskPhone(fPhone.value); clearError(fPhone); });
  fPhone.addEventListener('blur', () => { if (fPhone.value.replace(/\D/g, '').length < 2) fPhone.value = ''; });

  function setError(input, msg) {
    const field = input.closest('.field');
    field.classList.add('invalid');
    const err = $('.field-error', field);
    if (err) err.textContent = msg;
  }
  function clearError(input) { input.closest('.field').classList.remove('invalid'); }
  [fName, fDate].forEach((el) => el.addEventListener('input', () => clearError(el)));

  function validate() {
    let ok = true;
    if (fName.value.trim().length < 2) { setError(fName, 'Укажите имя — как к вам обращаться?'); ok = false; }
    if (fPhone.value.replace(/\D/g, '').length !== 11) { setError(fPhone, 'Введите номер полностью: +7 (XXX) XXX-XX-XX'); ok = false; }
    if (!fDate.value) { setError(fDate, 'Выберите дату визита'); ok = false; }
    else if (fDate.value < fDate.min) { setError(fDate, 'Дата уже прошла — выберите будущий день'); ok = false; }
    if (!fConsent.checked) { toast('Нужно согласие на обработку персональных данных'); ok = false; }
    return ok;
  }

  function resetBooking() {
    successBox.hidden = true;
    form.hidden = false;
    submitBtn.classList.remove('is-loading');
    $('.btn-label', submitBtn).textContent = 'Забронировать честный прием';
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (submitBtn.classList.contains('is-loading')) return;
    if (!validate()) {
      const firstInvalid = $('.field.invalid .field-input', form);
      if (firstInvalid) firstInvalid.focus();
      return;
    }
    submitBtn.classList.add('is-loading');
    $('.btn-label', submitBtn).textContent = 'Отправляем заявку…';

    setTimeout(() => {
      const dateStr = new Date(fDate.value + 'T00:00:00').toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
      const rows = [
        ['Пациент', fName.value.trim()],
        ['Телефон', fPhone.value],
        ['Направление', fDirection.selectedOptions[0].textContent],
        ['Врач', fDoctor.selectedOptions[0].textContent],
        ['Дата и время', dateStr + ' · ' + fTime.selectedOptions[0].textContent]
      ];
      $('#successSummary').innerHTML = rows.map((r) => '<dt>' + r[0] + '</dt><dd></dd>').join('');
      $$('#successSummary dd').forEach((dd, i) => { dd.textContent = rows[i][1]; });
      try {
        localStorage.setItem('chestnaya_booking', JSON.stringify({ name: fName.value.trim(), phone: fPhone.value, date: fDate.value, ts: Date.now() }));
      } catch (err) { /* storage unavailable */ }
      form.hidden = true;
      successBox.hidden = false;
      submitBtn.classList.remove('is-loading');
      toast('Заявка принята! Администратор перезвонит в течение 5 минут.', 'success');
    }, 900);
  });

  $('#newBooking').addEventListener('click', () => {
    resetBooking();
    form.reset();
    fDate.value = iso(tomorrow);
    fConsent.checked = true;
    fName.focus();
  });

  /* ---------- Before / After comparison sliders ---------- */
  $$('[data-compare]').forEach((box) => {
    const range = $('.compare-range', box);
    const labelBefore = $('.label-before', box);
    const labelAfter = $('.label-after', box);
    function update() {
      const v = parseFloat(range.value);
      box.style.setProperty('--pos', v + '%');
      labelBefore.classList.toggle('is-dim', v < 16);
      labelAfter.classList.toggle('is-dim', v > 84);
    }
    range.addEventListener('input', update);
    update();
  });

  /* ---------- FAQ accordion ---------- */
  $$('.faq-item').forEach((item) => {
    const btn = $('.faq-q', item);
    btn.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      $$('.faq-item.open').forEach((other) => {
        other.classList.remove('open');
        $('.faq-q', other).setAttribute('aria-expanded', 'false');
      });
      item.classList.toggle('open', !isOpen);
      btn.setAttribute('aria-expanded', String(!isOpen));
    });
  });

  /* ---------- Legal modal ---------- */
  const modal = $('#legalModal');
  const modalTitle = $('#modalTitle');
  const modalBody = $('#modalBody');
  const legalTexts = {
    privacy: {
      title: 'Политика конфиденциальности',
      body: '<p><strong>1. Какие данные мы собираем.</strong> Через форму записи мы получаем только ваше имя, номер телефона, желаемую дату визита и комментарий. Эти данные нужны исключительно для подтверждения записи.</p><p><strong>2. Как мы их используем.</strong> Администратор связывается с вами по указанному номеру, чтобы подтвердить прием. Мы не передаем данные третьим лицам, не используем их для рекламных рассылок и не продаем базы.</p><p><strong>3. Хранение и защита.</strong> Данные хранятся в защищенной медицинской информационной системе с разграничением доступа. Вы можете в любой момент отозвать согласие, позвонив по номеру +7 (495) 890-44-22.</p><p><strong>4. Файлы cookie.</strong> Сайт использует только технические cookie, необходимые для работы формы. Аналитические и рекламные трекеры не подключены.</p>'
    },
    offer: {
      title: 'Публичная оферта',
      body: '<p><strong>1. Предмет.</strong> ООО «Честная Стоматология» (ОГРН 1227700492810) оказывает платные стоматологические услуги в соответствии с лицензией № Л041-01137-77/00349120 и утвержденным планом лечения.</p><p><strong>2. Фиксация стоимости.</strong> Итоговая стоимость лечения фиксируется в договоре до начала процедур. Если фактический объем лечения превышает запланированный по независящим от пациента причинам, разницу оплачивает клиника.</p><p><strong>3. Оплата.</strong> Оплата производится наличными, картой или во внутреннюю беспроцентную рассрочку на 3–6 платежей. Цены на сайте указаны в рублях и включают анестезию, материалы, снимки и контрольные осмотры.</p><p><strong>4. Гарантия.</strong> Гарантийные сроки указываются в гарантийном талоне и зависят от вида конструкции: до 10 лет на ортопедические работы, пожизненно на имплантаты Straumann. Гарантия действует при соблюдении рекомендаций врача и профилактических визитах раз в 6 месяцев.</p><p><strong>5. Запись.</strong> Заявка через сайт не является публичным акцептом — администратор подтверждает время визита по телефону. Первичная консультация и составление плана лечения бесплатны.</p>'
    }
  };
  $$('[data-legal]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const doc = legalTexts[btn.dataset.legal];
      modalTitle.textContent = doc.title;
      modalBody.innerHTML = doc.body;
      modal.showModal();
    });
  });
  $('#modalClose').addEventListener('click', () => modal.close());
  modal.addEventListener('click', (e) => { if (e.target === modal) modal.close(); });

  /* ---------- Footer year ---------- */
  $('#year').textContent = String(new Date().getFullYear());
})();