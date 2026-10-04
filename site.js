(() => {
  'use strict';

  const menuButton = document.querySelector('.menu-toggle');
  const nav = document.querySelector('#site-nav');
  const closeMenu = () => {
    if (!menuButton || !nav) return;
    nav.classList.remove('open');
    menuButton.setAttribute('aria-expanded', 'false');
  };
  menuButton?.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('open');
    menuButton.setAttribute('aria-expanded', String(isOpen));
  });
  nav?.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') closeMenu();
  });
  document.addEventListener('click', event => {
    if (nav?.classList.contains('open') && !event.target.closest('.navbar')) closeMenu();
  });

  const year = document.querySelector('#year');
  if (year) year.textContent = String(new Date().getFullYear());

  const revealItems = document.querySelectorAll('.reveal');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reducedMotion || !('IntersectionObserver' in window)) {
    revealItems.forEach(item => item.classList.add('visible'));
  } else {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -24px 0px' });
    revealItems.forEach(item => observer.observe(item));
  }

  // Prepare a WhatsApp draft; the visitor reviews it before sending.
  const contactForm = document.querySelector('#contact-form');
  const phoneInput = document.querySelector('#phone');
  const status = document.querySelector('#form-status');
  const fallback = document.querySelector('#whatsapp-fallback');
  const whatsappNumber = '201155780461';

  function normalizeEgyptianMobile(value) {
    const latin = String(value)
      .replace(/[٠-٩]/g, d => String(d.charCodeAt(0) - 0x0660))
      .replace(/[۰-۹]/g, d => String(d.charCodeAt(0) - 0x06F0))
      .trim();
    if (!/^\+?[\d\s().-]+$/.test(latin)) return null;
    let digits = latin.replace(/\D/g, '');
    if (digits.startsWith('00')) digits = digits.slice(2);
    if (digits.startsWith('20') && digits.length === 12) digits = `0${digits.slice(2)}`;
    if (!/^01[0125]\d{8}$/.test(digits)) return null;
    return `+20${digits.slice(1)}`;
  }

  phoneInput?.addEventListener('input', () => phoneInput.setCustomValidity(''));
  contactForm?.addEventListener('submit', event => {
    event.preventDefault();
    if (!contactForm.reportValidity()) return;
    const normalizedPhone = normalizeEgyptianMobile(phoneInput.value);
    if (!normalizedPhone) {
      phoneInput.setCustomValidity('أدخل رقم محمول مصري صحيحًا، مثل 01012345678 أو +201012345678.');
      phoneInput.reportValidity();
      return;
    }
    phoneInput.setCustomValidity('');
    const data = new FormData(contactForm);
    const name = String(data.get('name') || '').trim();
    const service = String(data.get('service') || '').trim();
    const details = String(data.get('details') || '').trim();
    const message = [
      'مرحبًا مهندس أكرم، أرغب في الاستفسار عن خدمة.',
      `الاسم/الشركة: ${name}`,
      `رقم التواصل: ${normalizedPhone}`,
      `الخدمة: ${service}`,
      details ? `نبذة عن الاحتياج: ${details}` : ''
    ].filter(Boolean).join('\n');
    const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    if (fallback) { fallback.href = url; fallback.hidden = false; }
    if (status) status.textContent = 'يفتح واتساب برسالة جاهزة؛ راجعها قبل الإرسال.';
    const opened = window.open(url, '_blank');
    if (opened) opened.opener = null;
    else if (status) status.textContent = 'استخدم الرابط البديل الظاهر أدناه لفتح واتساب.';
  });

  // Three-step needs assistant with accessible focus and a useful WhatsApp summary.
  const assistant = document.querySelector('#needs-assistant-form');
  if (!assistant) return;
  const steps = [...assistant.querySelectorAll('.assistant-step')];
  const questions = assistant.querySelector('.assistant-questions');
  const result = assistant.querySelector('.assistant-result');
  const back = assistant.querySelector('[data-assistant-back]');
  const next = assistant.querySelector('[data-assistant-next]');
  const restart = assistant.querySelector('[data-assistant-restart]');
  const progress = assistant.querySelector('.assistant-progress-bar');
  const progressText = assistant.querySelector('.assistant-progress-text');
  const resultTitle = assistant.querySelector('[data-result-title]');
  const resultText = assistant.querySelector('[data-result-text]');
  const resultList = assistant.querySelector('[data-result-list]');
  const resultWhatsapp = assistant.querySelector('[data-result-whatsapp]');
  let current = 0;

  function showStep(index) {
    current = index;
    steps.forEach((step, i) => { step.hidden = i !== current; });
    if (back) back.hidden = current === 0;
    if (next) next.textContent = current === steps.length - 1 ? 'اعرض التوجيه الأولي' : 'التالي';
    if (progress) progress.style.width = `${((current + 1) / steps.length) * 100}%`;
    if (progressText) progressText.textContent = `الخطوة ${current + 1} من ${steps.length}`;
    const legend = steps[current]?.querySelector('legend');
    legend?.setAttribute('tabindex', '-1');
    legend?.focus({ preventScroll: true });
  }

  function getChoice(name) {
    return assistant.querySelector(`input[name="${name}"]:checked`)?.value || '';
  }
  function getLabel(name) {
    const input = assistant.querySelector(`input[name="${name}"]:checked`);
    return input?.closest('label')?.querySelector('b')?.textContent.trim() || '';
  }
  function guidance(activity, need) {
    const activityNames = { factory: 'مصنع أغذية', dairy: 'ألبان أو شوكولاتة', warehouse: 'مخازن أو سلسلة إمداد', startup: 'مشروع غذائي ناشئ' };
    const needs = {
      certification: { title: 'ابدأ بتقييم الجاهزية', text: 'التوجيه الأقرب هو مراجعة الفجوات والمتطلبات ذات الصلة بنشاطك قبل التفتيش أو التدقيق.', items: ['تحديد نطاق المنشأة والزيارة المستهدفة', 'مراجعة الوثائق والسجلات والممارسات', 'ترتيب الفجوات وخطوات المعالجة'] },
      training: { title: 'حدّد احتياج التدريب', text: 'التوجيه الأقرب هو تصميم تدريب عملي مرتبط بمهمة الفريق ومستوى خبرته.', items: ['تحديد الفئة وعدد المشاركين', 'اختيار موضوع مثل HACCP أو GMP أو ISO', 'مواءمة التدريب مع إجراءات المنشأة'] },
      system: { title: 'ابدأ بتحليل النظام الحالي', text: 'التوجيه الأقرب هو مراجعة الإجراءات والسجلات ومتابعة الإجراءات التصحيحية لتحديد أولويات التحسين.', items: ['مراجعة النظام القائم وما يُطبّق فعليًا', 'تحديد الفجوات والمخاطر ذات الأولوية', 'وضع خطة تنفيذ ومتابعة قابلة للقياس'] },
      general: { title: 'ابدأ بمحادثة استكشافية', text: 'يمكن تحديد المسار الأنسب بعد فهم النشاط والهدف والموعد المتوقع.', items: ['توضيح نوع المنتج والعمليات', 'شرح التحدي أو الهدف المطلوب', 'الاتفاق على الخطوة التالية المناسبة'] }
    };
    const chosen = needs[need] || needs.general;
    return { ...chosen, activity: activityNames[activity] || 'منشأة غذائية' };
  }

  function displayResult() {
    const activity = getChoice('activity');
    const need = getChoice('need');
    const urgency = getChoice('urgency');
    const recommendation = guidance(activity, need);
    if (resultTitle) resultTitle.textContent = recommendation.title;
    if (resultText) resultText.textContent = `${recommendation.text} نوع النشاط: ${recommendation.activity}. توقيت البدء: ${getLabel('urgency')}.`;
    if (resultList) {
      resultList.replaceChildren(...recommendation.items.map(item => {
        const li = document.createElement('li'); li.textContent = item; return li;
      }));
    }
    const summary = [
      'مرحبًا مهندس أكرم، أكملت مساعد تحديد الاحتياج وأرغب في معرفة الخطوة التالية.',
      `نوع النشاط: ${recommendation.activity}`,
      `الاحتياج: ${getLabel('need')}`,
      `توقيت البدء: ${getLabel('urgency')}`,
      `التوجيه الأولي: ${recommendation.title}`
    ].join('\n');
    if (resultWhatsapp) resultWhatsapp.href = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(summary)}`;
    if (questions) questions.hidden = true;
    if (result) result.hidden = false;
    resultTitle?.focus?.({ preventScroll: true });
  }

  next?.addEventListener('click', () => {
    const selected = getChoice(['activity', 'need', 'urgency'][current]);
    const error = steps[current]?.querySelector('.assistant-error');
    if (!selected) {
      if (error) error.textContent = 'اختر إجابة للمتابعة.';
      steps[current]?.querySelector('input')?.focus();
      return;
    }
    if (error) error.textContent = '';
    if (current < steps.length - 1) showStep(current + 1); else displayResult();
  });
  back?.addEventListener('click', () => { if (current > 0) showStep(current - 1); });
  assistant.querySelectorAll('input[type="radio"]').forEach(input => input.addEventListener('change', () => {
    const error = input.closest('fieldset')?.querySelector('.assistant-error');
    if (error) error.textContent = '';
  }));
  restart?.addEventListener('click', () => {
    assistant.reset();
    assistant.querySelectorAll('.assistant-error').forEach(error => { error.textContent = ''; });
    if (result) result.hidden = true;
    if (questions) questions.hidden = false;
    showStep(0);
  });
  showStep(0);
})();
