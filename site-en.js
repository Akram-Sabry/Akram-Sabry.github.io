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
      phoneInput.setCustomValidity('Enter a valid Egyptian mobile number, e.g. 01012345678 or +201012345678.');
      phoneInput.reportValidity();
      return;
    }
    phoneInput.setCustomValidity('');
    const data = new FormData(contactForm);
    const name = String(data.get('name') || '').trim();
    const service = String(data.get('service') || '').trim();
    const details = String(data.get('details') || '').trim();
    const message = [
      'Hello Akram, I would like to enquire about a service.',
      `Name/company: ${name}`,
      `Contact number: ${normalizedPhone}`,
      `Service: ${service}`,
      details ? `Brief description: ${details}` : ''
    ].filter(Boolean).join('\n');
    const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    if (fallback) { fallback.href = url; fallback.hidden = false; }
    if (status) status.textContent = 'A WhatsApp draft is ready. Please review it before sending.';
    const opened = window.open(url, '_blank');
    if (opened) opened.opener = null;
    else if (status) status.textContent = 'Use the fallback link below to open WhatsApp.';
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
    if (next) next.textContent = current === steps.length - 1 ? 'Show initial guidance' : 'Next';
    if (progress) progress.style.width = `${((current + 1) / steps.length) * 100}%`;
    if (progressText) progressText.textContent = `Step ${current + 1} of ${steps.length}`;
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
    const activityNames = { factory: 'Food manufacturer', dairy: 'Dairy or chocolate', warehouse: 'Warehouse or supply chain', startup: 'Food startup' };
    const needs = {
      certification: { title: 'Start with a readiness assessment', text: 'The most relevant next step is to review gaps and requirements for your business before an inspection or audit.', items: ['Define the facility scope and upcoming visit', 'Review documents, records, and practices', 'Prioritize gaps and corrective actions'] },
      training: { title: 'Define your training needs', text: 'The best fit may be practical training tailored to the team’s roles and experience.', items: ['Identify participants and group size', 'Choose topics such as HACCP, GMP, or ISO', 'Align training with facility procedures'] },
      system: { title: 'Start by reviewing the current system', text: 'The next step may be to review procedures, records, and corrective actions to prioritize improvements.', items: ['Review the existing system and actual practices', 'Identify priority gaps and risks', 'Create a measurable implementation and follow-up plan'] },
      general: { title: 'Start with an introductory discussion', text: 'The right approach can be identified after understanding your business, goals, and timeframe.', items: ['Describe the product and processes', 'Explain the challenge or desired outcome', 'Agree on a suitable next step'] }
    };
    const chosen = needs[need] || needs.general;
    return { ...chosen, activity: activityNames[activity] || 'Food business' };
  }

  function displayResult() {
    const activity = getChoice('activity');
    const need = getChoice('need');
    const urgency = getChoice('urgency');
    const recommendation = guidance(activity, need);
    if (resultTitle) resultTitle.textContent = recommendation.title;
    if (resultText) resultText.textContent = `${recommendation.text} Business type: ${recommendation.activity}. Target start: ${getLabel('urgency')}.`;
    if (resultList) {
      resultList.replaceChildren(...recommendation.items.map(item => {
        const li = document.createElement('li'); li.textContent = item; return li;
      }));
    }
    const summary = [
      'Hello Akram, I completed the needs assistant and would like to discuss the next step.',
      `Business type: ${recommendation.activity}`,
      `Main need: ${getLabel('need')}`,
      `Target start: ${getLabel('urgency')}`,
      `Initial guidance: ${recommendation.title}`
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
      if (error) error.textContent = 'Please select an answer to continue.';
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
