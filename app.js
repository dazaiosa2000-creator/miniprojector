(function () {
  'use strict';

  var C = window.SHOP;
  var METHODS = { stopdesk: 'Stop Desk', domicile: 'Livraison à domicile' };
  var PHONE_RE = /^(?:(?:\+|00)213|0)(?:[567]\d{8}|[234]\d{7})$/;
  var MOBILE_MAX = 820;
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var $ = function (id) { return document.getElementById(id); };

  // "20000" -> "20 000 DA" (non-breaking spaces in the UI, plain spaces in messages)
  function money(n, sep) {
    sep = sep || ' ';
    return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, sep) + sep + 'DA';
  }
  function plainMoney(n) { return money(n, ' '); }
  function norm(s) {
    return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/['’\-]/g, ' ');
  }
  function code(i) { return String(i + 1).padStart(2, '0'); }
  function wilayaLabel(name) {
    var i = C.WILAYAS.indexOf(name);
    return i < 0 ? name : code(i) + ' - ' + name;
  }
  function stopDeskRate(name) {
    var r = C.deliveryRates[name];
    return typeof r === 'number' ? r : null;
  }

  var state = { wilaya: '', method: '', qty: 1, status: 'idle' };

  // ---------- Pricing ----------
  function calc() {
    var rate = state.wilaya ? stopDeskRate(state.wilaya) : null;
    var unknown = !!state.wilaya && rate === null;
    var fee = rate !== null && state.method
      ? (state.method === 'domicile' ? rate + C.HOME_DELIVERY_SURCHARGE : rate)
      : null;
    var subtotal = C.PRODUCT_PRICE * state.qty;
    var total = fee !== null ? subtotal + fee : null;
    return { rate: rate, unknown: unknown, fee: fee, subtotal: subtotal, total: total };
  }

  // ---------- Elements ----------
  var form = $('order-form');
  var nameInput = $('f-name');
  var phoneInput = $('f-phone');
  var honeyInput = $('f-honey');
  var wBtn = $('w-btn'), wValue = $('w-value'), wPanel = $('w-panel'), wSearch = $('w-search'), wList = $('w-list'), wEmpty = $('w-empty');
  var methodsEl = $('methods');
  var methodBtns = methodsEl.querySelectorAll('[data-method]');
  var submitBtn = $('submit');
  var errors = { wilaya: $('err-wilaya'), method: $('err-method'), name: $('err-name'), phone: $('err-phone'), fee: $('err-fee') };

  // ---------- Hero headline (config) ----------
  if (C.HERO_HEADLINE) $('hero-title').textContent = C.HERO_HEADLINE;

  // ---------- Scroll to order ----------
  function toOrder() {
    var el = $('commande');
    window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 4, behavior: reduceMotion ? 'auto' : 'smooth' });
  }
  document.querySelectorAll('[data-to-order]').forEach(function (b) { b.addEventListener('click', toOrder); });

  // ---------- Errors ----------
  function setError(key, msg) {
    var el = errors[key];
    if (el) el.textContent = msg || '';
    if (key === 'wilaya') wBtn.setAttribute('aria-invalid', msg ? 'true' : 'false');
    if (key === 'method') methodsEl.classList.toggle('is-invalid', !!msg);
    if (key === 'name') nameInput.setAttribute('aria-invalid', msg ? 'true' : 'false');
    if (key === 'phone') phoneInput.setAttribute('aria-invalid', msg ? 'true' : 'false');
  }
  function clearSendError() { $('send-error').hidden = true; }

  function validate() {
    var e = {};
    var name = nameInput.value.trim();
    if (name.length < 3 || !/\p{L}/u.test(name)) e.name = 'Veuillez saisir votre nom et prénom.';
    if (!PHONE_RE.test(phoneInput.value.replace(/[\s.\-()]/g, ''))) e.phone = 'Veuillez saisir un numéro de téléphone valide.';
    if (!state.wilaya) e.wilaya = 'Veuillez sélectionner votre Wilaya.';
    if (!state.method) e.method = 'Veuillez choisir un mode de livraison.';
    if (!Number.isInteger(state.qty) || state.qty < 1 || state.qty > C.MAX_QTY) e.qty = 'Veuillez choisir une quantité valide.';
    return e;
  }
  function showErrors(e) {
    ['wilaya', 'method', 'name', 'phone', 'fee'].forEach(function (k) { setError(k, e[k]); });
    var order = ['wilaya', 'method', 'name', 'phone'];
    for (var i = 0; i < order.length; i++) {
      if (!e[order[i]]) continue;
      var target = { wilaya: wBtn, method: methodBtns[0], name: nameInput, phone: phoneInput }[order[i]];
      target.focus({ preventScroll: true });
      target.scrollIntoView({ block: 'center', behavior: reduceMotion ? 'auto' : 'smooth' });
      break;
    }
  }

  // ---------- Animated total ----------
  var shownTotal = C.PRODUCT_PRICE, targetTotal = C.PRODUCT_PRICE, raf = 0;
  function tweenTo(to, onFrame) {
    cancelAnimationFrame(raf);
    if (reduceMotion) { shownTotal = to; onFrame(); return; }
    var from = shownTotal, t0 = performance.now();
    function step(now) {
      var p = Math.min(1, (now - t0) / 380), eased = 1 - Math.pow(1 - p, 3);
      shownTotal = p < 1 ? Math.round((from + (to - from) * eased) / 10) * 10 : to;
      onFrame();
      if (p < 1) raf = requestAnimationFrame(step);
    }
    raf = requestAnimationFrame(step);
  }

  // ---------- Render ----------
  function renderTotal() {
    var c = calc();
    $('total').textContent = c.total !== null ? money(shownTotal) : money(c.subtotal) + ' + livraison';
  }

  function render() {
    var c = calc();

    // Wilaya button
    wValue.textContent = state.wilaya ? wilayaLabel(state.wilaya) : 'Sélectionnez votre Wilaya';
    wBtn.classList.toggle('has-value', !!state.wilaya);

    // Delivery method cards
    methodBtns.forEach(function (b) {
      var m = b.getAttribute('data-method');
      b.setAttribute('aria-checked', String(state.method === m));
      b.tabIndex = state.method ? (state.method === m ? 0 : -1) : (m === 'stopdesk' ? 0 : -1);
      var price;
      if (!state.wilaya) price = 'Selon votre Wilaya';
      else if (c.unknown) price = 'À confirmer';
      else price = money(m === 'domicile' ? c.rate + C.HOME_DELIVERY_SURCHARGE : c.rate);
      $('p-' + m).textContent = price;
    });

    // Quantity
    $('q-val').textContent = state.qty + (state.qty > 1 ? ' unités' : ' unité');
    $('q-dec').disabled = state.qty <= 1;
    $('q-inc').disabled = state.qty >= C.MAX_QTY;

    // Summary
    $('sub-hint').textContent = state.qty + ' × ' + money(C.PRODUCT_PRICE);
    $('sub').textContent = money(c.subtotal);
    var fee = $('fee');
    fee.className = '';
    if (!state.wilaya) { fee.textContent = 'Choisissez votre Wilaya'; fee.className = 'is-hint'; }
    else if (c.unknown) { fee.textContent = 'Frais de livraison à confirmer'; fee.className = 'is-tbc'; }
    else if (!state.method) { fee.textContent = 'Choisissez le mode'; fee.className = 'is-hint'; }
    else fee.textContent = money(c.fee);

    var tgt = c.total !== null ? c.total : c.subtotal;
    if (tgt !== targetTotal) { targetTotal = tgt; tweenTo(tgt, renderTotal); }
    renderTotal();

    // Unknown tariff => WhatsApp only
    $('unknown-notice').hidden = !c.unknown;
    $('normal-actions').hidden = c.unknown;
    $('wa-primary').hidden = !c.unknown;

    var sending = state.status === 'sending';
    submitBtn.disabled = sending;
    submitBtn.textContent = sending ? 'ENVOI EN COURS…' : c.total !== null ? 'PASSER MA COMMANDE · ' + money(c.total) : 'PASSER MA COMMANDE';
  }

  // ---------- Wilaya combobox ----------
  var optionEls = C.WILAYAS.map(function (name, i) {
    var li = document.createElement('li');
    li.setAttribute('role', 'none');
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'combo__opt';
    b.id = 'w-opt-' + code(i);
    b.setAttribute('role', 'option');
    b.setAttribute('aria-selected', 'false');
    b.tabIndex = -1;
    var r = stopDeskRate(name);
    b.innerHTML = '<span class="combo__code"></span><span class="combo__name"></span><span class="combo__rate"></span>';
    b.children[0].textContent = code(i);
    b.children[1].textContent = name;
    b.children[2].textContent = r !== null ? 'dès ' + money(r) : 'À confirmer';
    if (r === null) b.children[2].classList.add('combo__rate--tbc');
    b.addEventListener('click', function () { pickWilaya(name); });
    li.appendChild(b);
    wList.appendChild(li);
    return { name: name, code: code(i), key: norm(name), li: li, btn: b };
  });
  var visible = optionEls.slice(), active = -1;

  function filterWilayas() {
    var q = norm(wSearch.value.trim());
    var isNum = /^\d+$/.test(q);
    visible = optionEls.filter(function (o) {
      var show = !q || (isNum
        ? (o.code.indexOf(q.padStart(Math.min(2, q.length), '0')) === 0 || String(+o.code) === String(+q))
        : o.key.indexOf(q) !== -1);
      o.li.hidden = !show;
      return show;
    });
    wEmpty.hidden = visible.length > 0;
    setActive(q && visible.length ? 0 : -1);
  }
  function setActive(i) {
    if (active >= 0 && visible[active]) visible[active].btn.classList.remove('is-active');
    active = i;
    if (i >= 0 && visible[i]) {
      visible[i].btn.classList.add('is-active');
      visible[i].btn.scrollIntoView({ block: 'nearest' });
      wSearch.setAttribute('aria-activedescendant', visible[i].btn.id);
    } else {
      wSearch.removeAttribute('aria-activedescendant');
    }
  }
  function openCombo() {
    wPanel.hidden = false;
    wBtn.setAttribute('aria-expanded', 'true');
    wSearch.value = '';
    filterWilayas();
    // Focus the search on desktop only, so the mobile keyboard doesn't cover the list.
    if (window.innerWidth >= MOBILE_MAX) wSearch.focus({ preventScroll: true });
  }
  function closeCombo(returnFocus) {
    if (wPanel.hidden) return;
    wPanel.hidden = true;
    wBtn.setAttribute('aria-expanded', 'false');
    if (returnFocus) wBtn.focus();
  }
  function pickWilaya(name) {
    state.wilaya = name;
    optionEls.forEach(function (o) { o.btn.setAttribute('aria-selected', String(o.name === name)); });
    setError('wilaya'); setError('fee'); clearSendError();
    closeCombo(true);
    render();
  }

  wBtn.addEventListener('click', function () { wPanel.hidden ? openCombo() : closeCombo(false); });
  wBtn.addEventListener('keydown', function (e) {
    if ((e.key === 'ArrowDown' || e.key === 'ArrowUp') && wPanel.hidden) { e.preventDefault(); openCombo(); wSearch.focus(); }
  });
  wSearch.addEventListener('input', filterWilayas);
  wSearch.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { e.preventDefault(); closeCombo(true); }
    else if (e.key === 'ArrowDown') { e.preventDefault(); setActive(Math.min(visible.length - 1, active + 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive(Math.max(0, active - 1)); }
    else if (e.key === 'Enter') {
      e.preventDefault();
      var o = visible[active >= 0 ? active : 0];
      if (o) pickWilaya(o.name);
    }
  });
  wPanel.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeCombo(true); });
  document.addEventListener('pointerdown', function (e) {
    if (!wPanel.hidden && !$('combo').contains(e.target)) closeCombo(false);
  });

  // ---------- Delivery method ----------
  function pickMethod(m) {
    state.method = m;
    setError('method'); setError('fee'); clearSendError();
    render();
  }
  methodBtns.forEach(function (b) {
    b.addEventListener('click', function () { pickMethod(b.getAttribute('data-method')); });
    b.addEventListener('keydown', function (e) {
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].indexOf(e.key) === -1) return;
      e.preventDefault();
      var next = b.getAttribute('data-method') === 'stopdesk' ? 'domicile' : 'stopdesk';
      pickMethod(next);
      methodsEl.querySelector('[data-method="' + next + '"]').focus();
    });
  });

  // ---------- Quantity ----------
  $('q-dec').addEventListener('click', function () { state.qty = Math.max(1, state.qty - 1); render(); });
  $('q-inc').addEventListener('click', function () { state.qty = Math.min(C.MAX_QTY, state.qty + 1); render(); });

  // ---------- Text fields ----------
  nameInput.addEventListener('input', function () { setError('name'); setError('fee'); clearSendError(); });
  phoneInput.addEventListener('input', function () { setError('phone'); setError('fee'); clearSendError(); });

  // ---------- WhatsApp ----------
  function waMessage() {
    var c = calc();
    var feeTxt = c.fee !== null ? plainMoney(c.fee) : 'À confirmer';
    var totalTxt = c.total !== null ? plainMoney(c.total) : 'À confirmer (' + plainMoney(c.subtotal) + ' + livraison)';
    return [
      'Bonjour, je souhaite commander :', '',
      'Produit : ' + C.PRODUCT,
      'Prix unitaire : ' + plainMoney(C.PRODUCT_PRICE),
      'Quantité : ' + state.qty,
      'Sous-total : ' + plainMoney(c.subtotal), '',
      'Nom et prénom : ' + nameInput.value.trim(),
      'Téléphone : ' + phoneInput.value.trim(),
      'Wilaya : ' + wilayaLabel(state.wilaya),
      'Mode de livraison : ' + (state.method === 'domicile' ? 'Domicile' : 'Stop Desk'),
      'Frais de livraison : ' + feeTxt,
      'Total : ' + totalTxt, '',
      'Merci de confirmer ma commande.'
    ].join('\n');
  }
  function waUrl(text) { return 'https://wa.me/' + C.WHATSAPP + '?text=' + encodeURIComponent(text); }

  // Opens WhatsApp with the message pre-filled; the customer still presses "Envoyer" themselves.
  function openWhatsApp() {
    var e = validate();
    if (Object.keys(e).length) { showErrors(e); return; }
    window.open(waUrl(waMessage()), '_blank', 'noopener');
  }
  document.querySelectorAll('[data-whatsapp]').forEach(function (b) { b.addEventListener('click', openWhatsApp); });
  $('wa-help').href = waUrl("Bonjour, j'ai une question sur le Mini Projecteur HY320 Galaxy.");

  // ---------- FormSubmit ----------
  form.addEventListener('submit', function (ev) {
    ev.preventDefault();
    if (state.status === 'sending') return;
    var e = validate(), c = calc();
    if (c.unknown) e.fee = 'Le tarif de livraison pour cette Wilaya doit être confirmé. Utilisez le bouton WhatsApp.';
    if (Object.keys(e).length) { showErrors(e); return; }
    if (honeyInput.value) return; // bot

    var methodLabel = METHODS[state.method];
    var payload = {
      _subject: 'Nouvelle commande HY320 Galaxy - ' + state.wilaya + ' - ' + plainMoney(c.total),
      _template: 'table',
      _captcha: 'false',
      'Produit': C.PRODUCT,
      'Prix unitaire': plainMoney(C.PRODUCT_PRICE),
      'Quantité': String(state.qty),
      'Sous-total': plainMoney(c.subtotal),
      'Wilaya': wilayaLabel(state.wilaya),
      'Mode de livraison': methodLabel,
      'Frais de livraison': plainMoney(c.fee),
      'TOTAL': plainMoney(c.total),
      'Nom et prénom': nameInput.value.trim(),
      'Téléphone': phoneInput.value.trim()
    };

    state.status = 'sending';
    clearSendError();
    render();

    fetch(C.FORMSUBMIT_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(function (res) {
        return res.json().catch(function () { return {}; }).then(function (data) {
          if (!res.ok || !(data.success === true || data.success === 'true')) throw new Error(data.message || 'send failed');
        });
      })
      .then(function () {
        state.status = 'success';
        $('s-qty').textContent = String(state.qty);
        $('s-wilaya').textContent = wilayaLabel(state.wilaya);
        $('s-method').textContent = methodLabel;
        $('s-total').textContent = money(c.total);
        form.hidden = true;
        $('success').hidden = false;
        toOrder();
        $('success').focus({ preventScroll: true });
      })
      .catch(function () {
        state.status = 'idle';
        var box = $('send-error');
        box.textContent = "L'envoi de la commande n'a pas abouti. Vérifiez votre connexion et réessayez, ou commandez via WhatsApp.";
        box.hidden = false;
        render();
      });
  });

  $('again').addEventListener('click', function () {
    state.status = 'idle';
    state.qty = 1;
    nameInput.value = '';
    phoneInput.value = '';
    ['wilaya', 'method', 'name', 'phone', 'fee'].forEach(function (k) { setError(k); });
    $('success').hidden = true;
    form.hidden = false;
    render();
    nameInput.focus({ preventScroll: true });
  });

  // ---------- Gallery ----------
  var track = $('g-track');
  var slides = track.querySelectorAll('.slide');
  var dotsEl = $('g-dots');
  var gIndex = 0;
  var dots = Array.prototype.map.call(slides, function (_, i) {
    var d = document.createElement('button');
    d.type = 'button';
    d.className = 'dot';
    d.setAttribute('aria-label', 'Image ' + (i + 1));
    d.addEventListener('click', function () { gScrollTo(i); });
    dotsEl.appendChild(d);
    return d;
  });
  function slideStep() { return slides[0].getBoundingClientRect().width + 16; }
  function gScrollTo(i) {
    i = Math.max(0, Math.min(slides.length - 1, i));
    track.scrollTo({ left: i * slideStep(), behavior: reduceMotion ? 'auto' : 'smooth' });
  }
  function setGIndex(i) {
    gIndex = i;
    $('g-num').textContent = String(i + 1);
    dots.forEach(function (d, j) { d.setAttribute('aria-current', String(j === i)); });
  }
  track.addEventListener('scroll', function () {
    var atEnd = track.scrollLeft + track.clientWidth >= track.scrollWidth - 4;
    var i = atEnd ? slides.length - 1 : Math.round(track.scrollLeft / slideStep());
    if (i !== gIndex) setGIndex(i);
  }, { passive: true });
  track.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowRight') { e.preventDefault(); gScrollTo(gIndex + 1); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); gScrollTo(gIndex - 1); }
  });
  $('g-prev').addEventListener('click', function () { gScrollTo(gIndex - 1); });
  $('g-next').addEventListener('click', function () { gScrollTo(gIndex + 1); });
  setGIndex(0);

  // ---------- Sticky mobile CTA ----------
  var sticky = $('sticky'), formVisible = false;
  function updateSticky() {
    var show = C.STICKY_CTA !== false && window.innerWidth < MOBILE_MAX && window.scrollY > 520 && !formVisible;
    if (sticky.hidden === show) sticky.hidden = !show;
  }
  window.addEventListener('scroll', updateSticky, { passive: true });
  window.addEventListener('resize', updateSticky);

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      formVisible = entries[0].isIntersecting;
      updateSticky();
    }, { threshold: 0.02 }).observe($('commande'));

    // Fade-in for sections that start below the fold.
    if (!reduceMotion) {
      var revealIO = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (!en.isIntersecting) return;
          en.target.classList.add('is-visible');
          revealIO.unobserve(en.target);
        });
      }, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });
      document.querySelectorAll('[data-reveal]').forEach(function (el) {
        if (el.getBoundingClientRect().top > window.innerHeight) {
          el.classList.add('reveal-pending');
          revealIO.observe(el);
        }
      });
    }
  }
  updateSticky();

  render();
})();
