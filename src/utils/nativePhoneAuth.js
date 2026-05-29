// Minimal wrapper around the Android PhoneAuth Capacitor plugin
export function hasNativePhoneAuth() {
  try {
    return !!(window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.PhoneAuth);
  } catch (e) {
    return false;
  }
}

export async function startNativePhoneVerification(phone) {
  if (!hasNativePhoneAuth()) throw new Error('Native PhoneAuth plugin not available');
  const plugin = window.Capacitor.Plugins.PhoneAuth;
  // plugin returns a Promise which resolves when code is sent (we also notify via listeners)
  return plugin.startPhoneNumberVerification({ phone });
}

export async function verifyNativeCode(verificationId, code) {
  if (!hasNativePhoneAuth()) throw new Error('Native PhoneAuth plugin not available');
  const plugin = window.Capacitor.Plugins.PhoneAuth;
  return plugin.verifyCode({ verificationId, code });
}

export function addNativeListeners(handlers = {}) {
  if (!hasNativePhoneAuth()) return () => {};
  const plugin = window.Capacitor.Plugins.PhoneAuth;
  const listeners = [];

  if (handlers.codeSent) {
    listeners.push(plugin.addListener('codeSent', handlers.codeSent));
  }
  if (handlers.verificationCompleted) {
    listeners.push(plugin.addListener('verificationCompleted', handlers.verificationCompleted));
  }
  if (handlers.signInSuccess) {
    listeners.push(plugin.addListener('signInSuccess', handlers.signInSuccess));
  }
  if (handlers.signInFailed) {
    listeners.push(plugin.addListener('signInFailed', handlers.signInFailed));
  }

  return () => listeners.forEach(l => l.remove());
}
