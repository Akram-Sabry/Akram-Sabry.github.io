(() => {
  const startButton = document.getElementById('scan-start');
  const stopButton = document.getElementById('scan-stop');
  const video = document.getElementById('qr-video');
  const status = document.getElementById('scan-status');
  if (!startButton || !stopButton || !video || !status) return;

  const tokenPattern = /^[A-Fa-f0-9]{32}$/;
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d', { willReadFrequently: true });
  let stream = null;
  let active = false;
  let scanTimer = null;
  let decoderPromise = null;

  function message(arabic, english) {
    status.textContent = `${arabic} / ${english}`;
  }

  function loadDecoder() {
    if (window.jsQR) return Promise.resolve();
    if (decoderPromise) return decoderPromise;
    decoderPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = new URL('../assets/vendor/jsqr/jsQR.js', document.baseURI).href;
      script.onload = () => window.jsQR ? resolve() : reject(new Error('QR decoder did not initialize'));
      script.onerror = () => reject(new Error('QR decoder failed to load'));
      document.head.appendChild(script);
    }).catch((error) => {
      decoderPromise = null;
      throw error;
    });
    return decoderPromise;
  }

  function tokenFromQr(value) {
    const raw = String(value || '').trim();
    if (tokenPattern.test(raw)) return raw.toUpperCase();

    let url;
    try { url = new URL(raw); } catch (_) { return null; }
    if (url.origin !== location.origin) return null;

    const normalizePath = (path) => {
      const withoutIndex = path.replace(/index\.html$/i, '');
      return withoutIndex.endsWith('/') ? withoutIndex : `${withoutIndex}/`;
    };
    const verificationPath = normalizePath(new URL('./', location.href).pathname);
    if (normalizePath(url.pathname) !== verificationPath) return null;

    const token = url.searchParams.get('id') || url.searchParams.get('token') || '';
    return tokenPattern.test(token) ? token.toUpperCase() : null;
  }

  function stopScanner(statusMessage = '') {
    active = false;
    if (scanTimer !== null) {
      clearTimeout(scanTimer);
      scanTimer = null;
    }
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      stream = null;
    }
    video.pause();
    video.srcObject = null;
    video.hidden = true;
    startButton.hidden = false;
    startButton.disabled = false;
    stopButton.hidden = true;
    if (statusMessage) status.textContent = statusMessage;
  }

  function scanFrame() {
    if (!active) return;
    if (video.readyState >= HTMLMediaElement.HAVE_ENOUGH_DATA && video.videoWidth > 0 && context && window.jsQR) {
      try {
        const scale = Math.min(1, 800 / video.videoWidth);
        canvas.width = Math.max(1, Math.round(video.videoWidth * scale));
        canvas.height = Math.max(1, Math.round(video.videoHeight * scale));
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const frame = context.getImageData(0, 0, canvas.width, canvas.height);
        const result = window.jsQR(frame.data, frame.width, frame.height, { inversionAttempts: 'attemptBoth' });
        if (result) {
          const token = tokenFromQr(result.data);
          if (token) {
            stopScanner('تمت قراءة الرمز، جارٍ التحقق… / Code scanned; verifying…');
            document.dispatchEvent(new CustomEvent('certificate-token-scanned', { detail: { token } }));
            return;
          }
          message('هذا الرمز لا يحتوي على رابط تحقق صالح لهذه الصفحة.', 'This QR code is not a valid verification link for this site.');
        }
      } catch (_) {
        // Continue scanning; a transient camera frame can fail to decode.
      }
    }
    scanTimer = setTimeout(scanFrame, 220);
  }

  async function startScanner() {
    if (!window.isSecureContext || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      message('الكاميرا غير متاحة هنا؛ أدخل الرمز السري أو استخدم كاميرا الهاتف لمسح QR.', 'Camera scanning is unavailable; enter the token or use your phone camera to open the QR link.');
      return;
    }

    startButton.disabled = true;
    message('جارٍ تجهيز قارئ QR…', 'Preparing the QR scanner…');
    try {
      await loadDecoder();
      stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: { facingMode: { ideal: 'environment' } }
      });
      video.srcObject = stream;
      video.hidden = false;
      await video.play();
      active = true;
      startButton.hidden = true;
      stopButton.hidden = false;
      message('وجّه الكاميرا إلى رمز QR على الشهادة.', 'Point the camera at the QR code on the certificate.');
      scanFrame();
    } catch (error) {
      stopScanner();
      if (error && error.name === 'NotAllowedError') {
        message('لم يُسمح باستخدام الكاميرا. أدخل الرمز أو اسمح بالوصول إليها من إعدادات المتصفح.', 'Camera permission was denied. Enter the token or allow camera access in browser settings.');
      } else if (error && error.name === 'NotFoundError') {
        message('لم يتم العثور على كاميرا متاحة. أدخل الرمز السري أو امسح QR بكاميرا الهاتف.', 'No camera was found. Enter the token or scan with your phone camera.');
      } else {
        message('تعذر تشغيل الماسح. يمكنك إدخال الرمز السري أو مسح QR بكاميرا الهاتف.', 'The scanner could not start. Enter the token or scan with your phone camera.');
      }
    }
  }

  startButton.addEventListener('click', startScanner);
  stopButton.addEventListener('click', () => stopScanner('تم إيقاف الكاميرا. / Camera stopped.'));
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && active) stopScanner('تم إيقاف الكاميرا عند مغادرة الصفحة. / Camera stopped while leaving the page.');
  });
  window.addEventListener('pagehide', () => stopScanner());
})();
