const CSP_HEADERS = {
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https:",
    "media-src 'self' blob: https:",
    "connect-src 'self' http://localhost:* https://*.googleapis.com https://*.openai.com wss:",
    "font-src 'self' data:",
    "frame-src 'none'",
    "object-src 'none'"
  ].join('; ')
};

export function getCSPHeaders() {
  return CSP_HEADERS;
}

export function validateEmail(email) {
  if (typeof email !== 'string') return false;
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(email)) return false;
  if (email.length > 254) return false;
  return true;
}

export function validatePassword(password) {
  if (typeof password !== 'string') return false;
  if (password.length < 8) return false;
  if (password.length > 128) return false;
  if (!/[A-Z]/.test(password)) return false;
  if (!/[a-z]/.test(password)) return false;
  if (!/[0-9]/.test(password)) return false;
  return true;
}

export function sanitizeHTML(str) {
  if (typeof str !== 'string') return '';
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  };
  return str.replace(/[&<>"'/]/g, (char) => map[char]);
}

export function validateFileType(file, allowedTypes) {
  if (!file || !file.type) return false;
  return allowedTypes.some(type => file.type.startsWith(type));
}

export function validateFileSize(file, maxSizeMB = 500) {
  if (!file || !file.size) return false;
  const maxBytes = maxSizeMB * 1024 * 1024;
  return file.size <= maxBytes;
}

export function sanitizeFilename(filename) {
  if (typeof filename !== 'string') return 'file';
  return filename.replace(/[^a-zA-Z0-9._-]/g, '_').substring(0, 255);
}

export function validateURL(url) {
  if (typeof url !== 'string') return false;
  try {
    const parsed = new URL(url);
    const allowedHosts = [
      'youtube.com', 'www.youtube.com', 'youtu.be',
      'drive.google.com', 'vimeo.com', 'www.vimeo.com',
      'twitch.tv', 'www.twitch.tv', 'zoom.us',
      'tiktok.com', 'www.tiktok.com',
      'instagram.com', 'www.instagram.com'
    ];
    return allowedHosts.some(host => parsed.hostname === host);
  } catch {
    return false;
  }
}

export function rateLimiter(maxRequests = 30, windowMs = 60000) {
  const requests = new Map();

  return (userId) => {
    const now = Date.now();
    const userRequests = requests.get(userId) || [];

    const recentRequests = userRequests.filter(time => now - time < windowMs);

    if (recentRequests.length >= maxRequests) {
      return { allowed: false, retryAfter: Math.ceil((recentRequests[0] + windowMs - now) / 1000) };
    }

    recentRequests.push(now);
    requests.set(userId, recentRequests);
    return { allowed: true };
  };
}

export function generateCSRFToken() {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

export function validateApiKey(key) {
  if (typeof key !== 'string') return false;
  if (key.length < 10 || key.length > 200) return false;
  const validPatterns = [
    /^sk-/,
    /^gsk-/,
    /^AIza/,
    /^xi-/,
    /^ghp_/,
    /^gho_/,
    /^pk_/,
  ];
  return validPatterns.some(pattern => pattern.test(key));
}

export function logSecurityEvent(eventType, details) {
  const event = {
    type: sanitizeHTML(eventType),
    details: sanitizeHTML(JSON.stringify(details)),
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent?.substring(0, 200) || 'unknown'
  };
  try {
    const logs = JSON.parse(localStorage.getItem('security_logs') || '[]');
    logs.push(event);
    if (logs.length > 100) logs.shift();
    localStorage.setItem('security_logs', JSON.stringify(logs));
  } catch {}
}

export function encryptLocalData(data) {
  try {
    return btoa(unescape(encodeURIComponent(JSON.stringify(data))));
  } catch (e) {
    console.warn('Encrypt failed:', e);
    return null;
  }
}

export function decryptLocalData(encoded) {
  try {
    return JSON.parse(decodeURIComponent(escape(atob(encoded))));
  } catch (e) {
    console.warn('Decrypt failed:', e);
    return null;
  }
}

export const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo'];
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
export const MAX_FILE_SIZE_MB = 500;
