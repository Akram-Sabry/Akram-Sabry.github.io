(() => {
  'use strict';

  const form = document.querySelector('#needs-assistant');
  if (!form) return;

  const steps = [...form.querySelectorAll('.assistant-step')];
  const progress = form.querySelector('.assistant-progress-bar');
  const progressText = form.querySelector('.assistant-progress-text');
  const backButton = form.querySelector('[data-assistant-back]');
  const nextButton = form.querySelector('[data-assistant-next]');
  const result = form.querySelector('.assistant-result');
  const resultTitle = form.querySelector('[data-result-title]');
  const resultText = form.querySelector('[data-result-text]');
  const resultList = form.querySelector('[data-result-list]');
  const whatsappButton = form.querySelector('[data-result-whatsapp]');
  const restartButton = form.querySelector('[data-assistant-restart]');
  let currentStep = 0;

  const recommendations = {
    factory: {
      title: 'يبدو أن منشأتك تحتاج إلى تقييم نظام الجودة وسلامة الغذاء.',
      service: 'تقييم وتأهيل مصنع غذائي',
      actions: ['مراجعة الوضع الحالي والوثائق', 'تحليل الفجوات والمخاطر', 'تحديد خطة تطبيق ومتابعة مناسبة']
    },
    startup: {
      title: 'الخطوة الأنسب هي تأسيس نظام عملي من البداية.',
      service: 'تأسيس نظام جودة وسلامة غذاء لمشروع ناشئ',
      actions: ['تحديد المتطلبات الأساسية للنشاط', 'بناء إجراءات وسجلات مبسطة', 'تدريب الفريق على التطبيق اليومي']
    },
    dairy: {
      title: 'احتياجك يرتبط بضبط العمليات والتتبع وسلامة المنتج.',
      service: 'استشارة جودة وسلامة غذاء لمنتجات الألبان أو الأغذية',
      actions: ['مراجعة المخاطر وخطط HACCP', 'ضبط التتبع والسجلات', 'مراجعة ممارسات التصنيع والنظافة']
    },
    warehouse: {
      title: 'يبدو أن الأولوية هي التتبع والموردون وضبط التخزين.',
      service: 'تقييم المخازن وسلسلة الإمداد',
      actions: ['مراجعة التتبع والاستدعاء', 'تقييم الموردين', 'تطوير سجلات وضوابط التخزين']
    },
    certification: {
      title: 'الأولوية هي رفع جاهزية المنشأة للمراجعة أو التفتيش.',
      service: 'تجهيز للمراجعة أو التفتيش',
      actions: ['تنفيذ Gap Assessment', 'ترتيب حالات عدم المطابقة', 'إعداد خطة إجراءات تصحيحية CAPA']
    },
    training: {
      title: 'الاحتياج الأنسب هو برنامج تدريبي مخصص للفريق.',
      service: 'برنامج تدريبي لفريق الجودة وسلامة الغذاء',
      actions: ['تحديد مستوى الفريق واحتياجه', 'اختيار موضوعات التدريب المناسبة', 'ربط التدريب بعمليات المنشأة']
    },
    system: {
      title: 'الخطوة الأولى هي مراجعة النظام الحالي وتحديد فرص التحسين.',
      service: 'تطوير نظام ISO أو HACCP أو BRCGS',
      actions: ['مراجعة الوثائق والإجراءات', 'تقييم التطبيق الفعلي', 'بناء خطة تحسين قابلة للمتابعة']
    }
  };

  const labels = {
    activity: { factory: 'مصنع أغذية', dairy: 'ألبان أو شوكولاتة', warehouse: 'مخازن أو سلسلة إمداد', startup: 'مشروع غذائي ناشئ' },
    need: { certification: 'الاستعداد لتفتيش أو مراجعة', training: 'تدريب الفريق', system: 'تطوير نظام قائم', general: 'استشارة عامة' },
    urgency: { now: 'خلال أقرب وقت', month: 'خلال شهر', planning: 'ما زلت في مرحلة التخطيط' }
  };

  function setStep(index) {
    currentStep = Math.max(0, Math.min(index, steps.length - 1));
    steps.forEach((step, i) => step.hidden = i !== currentStep);
    const percent = ((currentStep + 1) / steps.length) * 100;
    if (progress) progress.style.width = `${percent}%`;
    if (progressText) progressText.textContent = `الخطوة ${currentStep + 1} من ${steps.length}`;
    if (backButton) backButton.hidden = currentStep === 0;
    if (nextButton) nextButton.textContent = currentStep === steps.length - 1 ? 'اعرض التوصية' : 'التالي';
  }

  function selectedValue(name) {
    return form.querySelector(`input[name="${name}"]:checked`)?.value || '';
  }

  function validateStep() {
    const current = steps[currentStep];
    const options = current.querySelectorAll('input[type="radio"]');
    const hasChoice = [...options].some(option => option.checked);
    current.querySelector('.assistant-error').textContent = hasChoice ? '' : 'اختر إجابة واحدة للمتابعة.';
    return hasChoice;
  }

  function buildRecommendation() {
    const activity = selectedValue('activity');
    const need = selectedValue('need');
    const urgency = selectedValue('urgency');
    let recommendation = recommendations[need] || recommendations[activity] || recommendations.factory;
    if (need === 'general' && activity === 'startup') recommendation = recommendations.startup;
    if (need === 'general' && activity === 'dairy') recommendation = recommendations.dairy;
    resultTitle.textContent = recommendation.title;
    resultText.textContent = `الخدمة المقترحة مبدئيًا: ${recommendation.service}.`;
    resultList.innerHTML = recommendation.actions.map(action => `<li>${action}</li>`).join('');
    const message = [
      'مرحبًا مهندس أكرم، استخدمت مساعد تحديد احتياج المنشأة.',
      `نوع النشاط: ${labels.activity[activity] || activity}`,
      `الاحتياج: ${labels.need[need] || need}`,
      `التوقيت المتوقع: ${labels.urgency[urgency] || urgency}`,
      `الخدمة المقترحة مبدئيًا: ${recommendation.service}`,
      'أرغب في الحصول على تقييم أدق وخطوة العمل المناسبة.'
    ].join('\n');
    whatsappButton.href = `https://wa.me/201155780461?text=${encodeURIComponent(message)}`;
    form.querySelector('.assistant-questions').hidden = true;
    result.hidden = false;
  }

  nextButton?.addEventListener('click', () => {
    if (!validateStep()) return;
    if (currentStep === steps.length - 1) buildRecommendation();
    else setStep(currentStep + 1);
  });
  backButton?.addEventListener('click', () => setStep(currentStep - 1));
  restartButton?.addEventListener('click', () => {
    form.reset();
    result.hidden = true;
    form.querySelector('.assistant-questions').hidden = false;
    setStep(0);
  });
  setStep(0);
})();
