(function() {
  'use strict';

  // SHA-256 implementation (Web Crypto API wrapper)
  async function sha256(data) {
    const encoder = new TextEncoder();
    const buffer = encoder.encode(data);
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  // Collect IP data from ipinfo.io
  async function collectIpData() {
    try {
      const response = await fetch('https://ipinfo.io/json');
      if (!response.ok) throw new Error(`ipinfo.io returned ${response.status}`);
      const data = await response.json();
      return {
        status: 'success',
        address: data.ip || null,
        city: data.city || null,
        region: data.region || null,
        country: data.country || null,
        org: data.org || null,
        timezone: data.timezone || null,
        loc: data.loc || null
      };
    } catch (error) {
      throw new Error(`IP collection failed: ${error.message}`);
    }
  }

  // Collect navigator data
  function collectNavigatorData() {
    try {
      const nav = navigator;
      return {
        status: 'success',
        userAgent: nav.userAgent || null,
        platform: nav.platform || null,
        languages: nav.languages ? Array.from(nav.languages) : [],
        language: nav.language || null,
        hardwareConcurrency: nav.hardwareConcurrency || null,
        deviceMemory: nav.deviceMemory || null,
        maxTouchPoints: nav.maxTouchPoints || 0,
        cookieEnabled: nav.cookieEnabled,
        doNotTrack: nav.doNotTrack || null,
        webdriver: !!nav.webdriver,
        pdfViewerEnabled: nav.pdfViewerEnabled !== undefined ? nav.pdfViewerEnabled : null,
        vendor: nav.vendor || null,
        vendorSub: nav.vendorSub || null,
        productSub: nav.productSub || null,
        plugins: Array.from(nav.plugins || []).map(p => ({
          name: p.name,
          filename: p.filename,
          description: p.description
        })),
        mimeTypes: Array.from(nav.mimeTypes || []).map(m => ({
          type: m.type,
          suffixes: m.suffixes
        })),
        connection: nav.connection ? {
          effectiveType: nav.connection.effectiveType,
          downlink: nav.connection.downlink,
          rtt: nav.connection.rtt,
          saveData: nav.connection.saveData
        } : null
      };
    } catch (error) {
      return { status: 'failed', error: error.message };
    }
  }

  // Collect screen data
  function collectScreenData() {
    try {
      const scr = window.screen;
      return {
        status: 'success',
        width: scr.width,
        height: scr.height,
        availWidth: scr.availWidth,
        availHeight: scr.availHeight,
        colorDepth: scr.colorDepth,
        pixelDepth: scr.pixelDepth,
        pixelRatio: window.devicePixelRatio || 1,
        orientation: scr.orientation ? {
          type: scr.orientation.type,
          angle: scr.orientation.angle
        } : null,
        innerWidth: window.innerWidth,
        innerHeight: window.innerHeight,
        outerWidth: window.outerWidth,
        outerHeight: window.outerHeight
      };
    } catch (error) {
      return { status: 'failed', error: error.message };
    }
  }

  // Canvas 2D fingerprint
  async function collectCanvasData() {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 280;
      canvas.height = 60;
      const ctx = canvas.getContext('2d');

      if (!ctx) throw new Error('Canvas 2D context not available');

      // Text rendering
      ctx.textBaseline = 'alphabetic';
      ctx.fillStyle = '#f60';
      ctx.fillRect(100, 1, 62, 20);

      ctx.fillStyle = '#069';
      ctx.font = '15px Arial, sans-serif';
      ctx.fillText('Cwm fjordbank glyphs vext quiz, 😃', 2, 15);

      ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
      ctx.font = '18px Times New Roman, serif';
      ctx.fillText('Cwm fjordbank glyphs vext quiz, 😃', 4, 45);

      // Geometric shapes
      ctx.strokeStyle = 'rgb(120, 186, 176)';
      ctx.arc(80, 30, 15, 0, Math.PI * 2, true);
      ctx.stroke();

      ctx.fillStyle = 'rgb(255, 0, 128)';
      ctx.beginPath();
      ctx.arc(200, 30, 12, 0, Math.PI * 2, true);
      ctx.fill();

      // Gradient
      const gradient = ctx.createLinearGradient(0, 0, 280, 0);
      gradient.addColorStop(0, 'red');
      gradient.addColorStop(0.5, 'green');
      gradient.addColorStop(1, 'blue');
      ctx.fillStyle = gradient;
      ctx.fillRect(220, 1, 50, 20);

      const dataUrl = canvas.toDataURL('image/png');
      const hash2d = await sha256(dataUrl);

      return {
        status: 'success',
        hash2d: hash2d,
        hashWebgl: null // Will be set by WebGL collection
      };
    } catch (error) {
      return { status: 'failed', error: error.message, hash2d: null, hashWebgl: null };
    }
  }

  // WebGL fingerprint
  async function collectWebglData() {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 256;
      canvas.height = 256;

      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) throw new Error('WebGL not available');

      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');

      const result = {
        status: 'success',
        vendor: gl.getParameter(gl.VENDOR),
        renderer: gl.getParameter(gl.RENDERER),
        unmaskedVendor: debugInfo ? gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) : null,
        unmaskedRenderer: debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : null,
        version: gl.getParameter(gl.VERSION),
        shadingLanguageVersion: gl.getParameter(gl.SHADING_LANGUAGE_VERSION),
        maxTextureSize: gl.getParameter(gl.MAX_TEXTURE_SIZE),
        maxViewportDims: Array.from(gl.getParameter(gl.MAX_VIEWPORT_DIMS)),
        maxRenderbufferSize: gl.getParameter(gl.MAX_RENDERBUFFER_SIZE),
        maxVertexAttribs: gl.getParameter(gl.MAX_VERTEX_ATTRIBS),
        maxVertexUniformVectors: gl.getParameter(gl.MAX_VERTEX_UNIFORM_VECTORS),
        maxFragmentUniformVectors: gl.getParameter(gl.MAX_FRAGMENT_UNIFORM_VECTORS),
        maxVaryingVectors: gl.getParameter(gl.MAX_VARYING_VECTORS),
        aliasedLineWidthRange: Array.from(gl.getParameter(gl.ALIASED_LINE_WIDTH_RANGE)),
        aliasedPointSizeRange: Array.from(gl.getParameter(gl.ALIASED_POINT_SIZE_RANGE)),
        extensions: gl.getSupportedExtensions(),
        hash: null
      };

      // Render WebGL image for hashing
      gl.clearColor(0.2, 0.4, 0.6, 1.0);
      gl.clear(gl.COLOR_BUFFER_BIT);

      const vertexShader = gl.createShader(gl.VERTEX_SHADER);
      gl.shaderSource(vertexShader, `
        attribute vec2 position;
        varying vec2 vPos;
        void main() {
          vPos = position;
          gl_Position = vec4(position, 0.0, 1.0);
        }
      `);
      gl.compileShader(vertexShader);

      const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
      gl.shaderSource(fragmentShader, `
        precision mediump float;
        varying vec2 vPos;
        void main() {
          gl_FragColor = vec4(vPos.x * 0.5 + 0.5, vPos.y * 0.5 + 0.5, 0.5, 1.0);
        }
      `);
      gl.compileShader(fragmentShader);

      const program = gl.createProgram();
      gl.attachShader(program, vertexShader);
      gl.attachShader(program, fragmentShader);
      gl.linkProgram(program);
      gl.useProgram(program);

      const vertices = new Float32Array([
        -0.5, -0.5,
         0.5, -0.5,
         0.0,  0.5
      ]);

      const buffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

      const positionLocation = gl.getAttribLocation(program, 'position');
      gl.enableVertexAttribArray(positionLocation);
      gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

      gl.drawArrays(gl.TRIANGLES, 0, 3);

      const dataUrl = canvas.toDataURL('image/png');
      result.hash = await sha256(dataUrl);

      return result;
    } catch (error) {
      return { status: 'failed', error: error.message };
    }
  }

  // Audio fingerprint
  async function collectAudioData() {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) throw new Error('AudioContext not available');

      const context = new AudioContext();
      const oscillator = context.createOscillator();
      const analyser = context.createAnalyser();
      const gain = context.createGain();
      const compressor = context.createDynamicsCompressor();

      // Configure nodes
      oscillator.type = 'triangle';
      oscillator.frequency.setValueAtTime(10000, context.currentTime);

      compressor.threshold.setValueAtTime(-50, context.currentTime);
      compressor.knee.setValueAtTime(40, context.currentTime);
      compressor.ratio.setValueAtTime(12, context.currentTime);
      compressor.attack.setValueAtTime(0, context.currentTime);
      compressor.release.setValueAtTime(0.25, context.currentTime);

      gain.gain.setValueAtTime(0, context.currentTime);

      // Connect nodes
      oscillator.connect(compressor);
      compressor.connect(analyser);
      analyser.connect(gain);
      gain.connect(context.destination);

      oscillator.start(0);

      // Wait for processing
      await new Promise(resolve => setTimeout(resolve, 100));

      const frequencyData = new Float32Array(analyser.frequencyBinCount);
      analyser.getFloatFrequencyData(frequencyData);

      oscillator.stop();
      await context.close();

      // Create fingerprint from frequency data
      const audioSignature = Array.from(frequencyData.slice(0, 100))
        .map(v => isFinite(v) ? v.toFixed(2) : '0')
        .join(',');

      const hash = await sha256(audioSignature);

      return {
        status: 'success',
        hash: hash,
        sampleRate: context.sampleRate,
        channelCount: context.destination.channelCount,
        maxChannelCount: context.destination.maxChannelCount,
        state: context.state
      };
    } catch (error) {
      return { status: 'failed', error: error.message };
    }
  }

  // Font detection
  async function collectFontsData() {
    try {
      const baseFonts = ['monospace', 'sans-serif', 'serif'];
      const testFonts = [
        'Arial', 'Arial Black', 'Arial Narrow', 'Calibri', 'Cambria',
        'Cambria Math', 'Comic Sans MS', 'Consolas', 'Courier', 'Courier New',
        'Georgia', 'Helvetica', 'Impact', 'Lucida Console', 'Lucida Sans Unicode',
        'Microsoft Sans Serif', 'Monaco', 'Palatino Linotype', 'Segoe UI',
        'Tahoma', 'Times', 'Times New Roman', 'Trebuchet MS', 'Verdana',
        'Wingdings', 'Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Source Sans Pro',
        'Ubuntu', 'Fira Sans', 'Droid Sans', 'Noto Sans', 'PT Sans',
        'Liberation Sans', 'DejaVu Sans', 'Cantarell', 'Oxygen',
        'Menlo', 'SF Pro', 'SF Mono', 'Avenir', 'Avenir Next', 'Optima',
        'Futura', 'Gill Sans', 'Baskerville', 'American Typewriter', 'Didot',
        'Apple Chancery', 'Zapfino', 'Papyrus', 'Brush Script MT'
      ];

      const testString = 'mmmmmmmmmmlli';
      const testSize = '72px';

      const canvas = document.createElement('canvas');
      canvas.width = 500;
      canvas.height = 100;
      const ctx = canvas.getContext('2d');

      // Get baseline widths
      const baseWidths = {};
      for (const baseFont of baseFonts) {
        ctx.font = `${testSize} ${baseFont}`;
        baseWidths[baseFont] = ctx.measureText(testString).width;
      }

      // Detect fonts
      const detected = [];
      for (const font of testFonts) {
        let isDetected = false;
        for (const baseFont of baseFonts) {
          ctx.font = `${testSize} "${font}", ${baseFont}`;
          const width = ctx.measureText(testString).width;
          if (width !== baseWidths[baseFont]) {
            isDetected = true;
            break;
          }
        }
        if (isDetected) {
          detected.push(font);
        }
      }

      return {
        status: 'success',
        detected: detected,
        count: detected.length
      };
    } catch (error) {
      return { status: 'failed', error: error.message };
    }
  }

  // Headless browser detection
  function collectHeadlessSignals() {
    try {
      const signals = {
        status: 'success',
        webdriver: false,
        phantom: false,
        nightmare: false,
        selenium: false,
        puppeteer: false,
        playwright: false,
        headlessChrome: false,
        automationFlags: [],
        inconsistencies: []
      };

      // Webdriver detection
      if (navigator.webdriver === true) {
        signals.webdriver = true;
        signals.automationFlags.push('navigator.webdriver');
      }

      // Check for webdriver in various locations
      const webdriverProps = [
        'webdriver', '_webdriver_script_fn', '_Selenium_IDE_Recorder',
        '_selenium', '__webdriver_script_fn', '__driver_evaluate',
        '__webdriver_evaluate', '__selenium_evaluate', '__fxdriver_evaluate',
        '__driver_unwrapped', '__webdriver_unwrapped', '__selenium_unwrapped',
        '__fxdriver_unwrapped', '__webdriver_script_func', 'calledSelenium',
        '_WEBDRIVER_ELEM_CACHE', 'ChromeDriverw', 'driver-hierarchical',
        'domAutomation', 'domAutomationController'
      ];

      for (const prop of webdriverProps) {
        if (prop in window || prop in document) {
          signals.selenium = true;
          signals.automationFlags.push(`window.${prop}`);
        }
      }

      // PhantomJS detection
      if (window.callPhantom || window._phantom) {
        signals.phantom = true;
        signals.automationFlags.push('PhantomJS');
      }

      // Nightmare detection
      if (window.__nightmare) {
        signals.nightmare = true;
        signals.automationFlags.push('Nightmare');
      }

      // Chrome headless detection
      const ua = navigator.userAgent.toLowerCase();
      if (ua.includes('headlesschrome')) {
        signals.headlessChrome = true;
        signals.automationFlags.push('HeadlessChrome UA');
      }

      // Puppeteer/Playwright common signs
      if (navigator.languages === undefined || navigator.languages.length === 0) {
        signals.inconsistencies.push('Empty languages');
      }

      // Check plugins (headless often has 0)
      if (navigator.plugins.length === 0) {
        signals.inconsistencies.push('No plugins');
      }

      // Check for missing image rendering
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = 'red';
        ctx.fillRect(0, 0, 1, 1);
        const imageData = ctx.getImageData(0, 0, 1, 1);
        if (imageData.data[0] === 0) {
          signals.inconsistencies.push('Canvas rendering anomaly');
        }
      }

      // Check permissions API behavior
      if (navigator.permissions) {
        signals.hasPermissionsAPI = true;
      }

      // Check notification permission
      if (Notification && Notification.permission === 'denied' && !navigator.webdriver) {
        // Might be a privacy-focused browser, not necessarily headless
      }

      // Chrome-specific checks
      if (window.chrome) {
        signals.hasChrome = true;
        if (!window.chrome.runtime) {
          signals.inconsistencies.push('Chrome object without runtime');
        }
      } else if (ua.includes('chrome')) {
        signals.inconsistencies.push('Chrome UA without chrome object');
        signals.puppeteer = true;
        signals.playwright = true;
      }

      // Check connection type
      const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
      if (connection && connection.rtt === 0) {
        signals.inconsistencies.push('Zero RTT');
      }

      // Check outer dimensions
      if (window.outerWidth === 0 || window.outerHeight === 0) {
        signals.inconsistencies.push('Zero outer dimensions');
      }

      // Check for automation-controlled browser
      if (navigator.webdriver ||
          document.documentElement.getAttribute('webdriver') ||
          document.documentElement.getAttribute('driver')) {
        signals.automationFlags.push('DOM automation attribute');
      }

      // Determine if likely automated
      signals.isLikelyBot = signals.automationFlags.length > 0 ||
                            signals.inconsistencies.length >= 3;

      return signals;
    } catch (error) {
      return { status: 'failed', error: error.message };
    }
  }

  // Timezone and locale data
  function collectTimezoneData() {
    try {
      const date = new Date();
      const dateString = date.toString();
      const timezoneOffset = date.getTimezoneOffset();

      let timezone = null;
      try {
        timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      } catch (e) {}

      let locale = null;
      try {
        locale = Intl.DateTimeFormat().resolvedOptions().locale;
      } catch (e) {}

      return {
        status: 'success',
        timezone: timezone,
        timezoneOffset: timezoneOffset,
        locale: locale,
        dateString: dateString
      };
    } catch (error) {
      return { status: 'failed', error: error.message };
    }
  }

  // Storage and feature detection
  function collectStorageData() {
    try {
      const result = {
        status: 'success',
        localStorage: false,
        sessionStorage: false,
        indexedDB: false,
        cookies: false
      };

      try {
        localStorage.setItem('__fp_test', '1');
        localStorage.removeItem('__fp_test');
        result.localStorage = true;
      } catch (e) {}

      try {
        sessionStorage.setItem('__fp_test', '1');
        sessionStorage.removeItem('__fp_test');
        result.sessionStorage = true;
      } catch (e) {}

      result.indexedDB = !!window.indexedDB;
      result.cookies = navigator.cookieEnabled;

      return result;
    } catch (error) {
      return { status: 'failed', error: error.message };
    }
  }

  // Progress callback helper
  function emitProgress(step, category) {
    if (typeof window.onFingerprintProgress === 'function') {
      try {
        window.onFingerprintProgress(step, category);
      } catch (e) {}
    }
  }

  // Main collection function
  async function collectFingerprint() {
    const fingerprint = {};
    const errors = [];

    // Step 0: Collect IP data (critical - will throw on failure)
    emitProgress(0, 'ip');
    fingerprint.ip = await collectIpData();

    // Step 1: Navigator
    emitProgress(1, 'navigator');
    fingerprint.navigator = collectNavigatorData();

    // Step 2: Screen
    emitProgress(2, 'screen');
    fingerprint.screen = collectScreenData();

    // Step 3: Timezone
    emitProgress(3, 'timezone');
    fingerprint.timezone = collectTimezoneData();

    // Step 4: Storage
    emitProgress(4, 'storage');
    fingerprint.storage = collectStorageData();

    // Step 5: Headless signals
    emitProgress(5, 'headlessSignals');
    fingerprint.headlessSignals = collectHeadlessSignals();

    // Steps 6-9: Collect async data with individual progress updates
    emitProgress(6, 'canvas');
    const canvasPromise = collectCanvasData().then(data => {
      fingerprint.canvas = data;
      return data;
    });

    emitProgress(7, 'webgl');
    const webglPromise = collectWebglData().then(data => {
      fingerprint.webgl = data;
      return data;
    });

    emitProgress(8, 'audio');
    const audioPromise = collectAudioData().then(data => {
      fingerprint.audio = data;
      return data;
    });

    emitProgress(9, 'fonts');
    const fontsPromise = collectFontsData().then(data => {
      fingerprint.fonts = data;
      return data;
    });

    // Wait for all async operations
    await Promise.all([canvasPromise, webglPromise, audioPromise, fontsPromise]);

    // Add WebGL hash to canvas object for convenience
    if (fingerprint.canvas.status === 'success' && fingerprint.webgl.status === 'success') {
      fingerprint.canvas.hashWebgl = fingerprint.webgl.hash;
    }

    // Check for critical failures
    const criticalComponents = ['ip', 'canvas', 'webgl'];
    for (const component of criticalComponents) {
      if (fingerprint[component].status === 'failed') {
        errors.push(`${component}: ${fingerprint[component].error}`);
      }
    }

    if (errors.length > 0) {
      throw new Error(`Critical fingerprint components failed: ${errors.join('; ')}`);
    }

    // Add metadata
    fingerprint.meta = {
      collectedAt: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      referrer: document.referrer || null
    };

    return fingerprint;
  }

  // Execute immediately
  (async function() {
    try {
      const fingerprint = await collectFingerprint();

      if (typeof window.onFingerprint === 'function') {
        window.onFingerprint(fingerprint);
      } else {
        console.error('Fingerprint: window.onFingerprint callback not defined');
        throw new Error('window.onFingerprint callback not defined');
      }
    } catch (error) {
      if (typeof window.onFingerprintError === 'function') {
        window.onFingerprintError(error);
      }
      throw error;
    }
  })();

})();
