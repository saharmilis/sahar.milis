/* Static AES-128-GCM certificate viewer. No external libraries or analytics. */
'use strict';
const statusEl = document.getElementById('status');
const outputEl = document.getElementById('certificate');
function status(message, isError=false) {
  statusEl.hidden = false;
  statusEl.textContent = message;
  statusEl.classList.toggle('error', isError);
}
function decodeBase64url(s) {
  if (!/^[A-Za-z0-9_-]+$/.test(s)) throw new Error('Malformed key or encrypted file.');
  const decoded = atob(s.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4-s.length%4)%4));
  return Uint8Array.from(decoded, c => c.charCodeAt(0));
}
async function render() {
  outputEl.hidden = true;
  statusEl.hidden = false;
  document.body.classList.remove('certificate-ready');
  outputEl.replaceChildren();
  // One compact fragment holds both the file ID and 128-bit secret key.
  // Example: #001.SOME_22_CHARACTER_KEY
  const match = /^#(\d{3})\.([A-Za-z0-9_-]{22})$/.exec(window.location.hash);
  if (!match) {status('Missing or invalid private link. Open the complete URL sent to you, including the # fragment.', true);return;}
  const [, id, keyText] = match;
  try {
    const rawKey = decodeBase64url(keyText);
    if (rawKey.byteLength !== 16) throw new Error('Invalid AES-128 key.');
    status('Loading and decrypting your certificate…');
    const [dataResponse, templateResponse] = await Promise.all([
      fetch(`${id}.enc.json`, {cache:'no-store'}),
      fetch('certificate-template.html', {cache:'no-store'})
    ]);
    if (!dataResponse.ok || !templateResponse.ok) throw new Error('Certificate files not found. Check that all files were uploaded to the same course folder.');
    const encrypted = await dataResponse.json();
    if (encrypted.v !== 1 || encrypted.alg !== 'AES-128-GCM') throw new Error('Unrecognized encrypted file format.');
    const iv = decodeBase64url(encrypted.iv);
    const ciphertext = decodeBase64url(encrypted.data);
    if (iv.byteLength !== 12) throw new Error('Invalid encryption nonce.');
    const key = await crypto.subtle.importKey('raw', rawKey, {name:'AES-GCM'}, false, ['decrypt']);
    const bytes = await crypto.subtle.decrypt({name:'AES-GCM', iv, tagLength:128}, key, ciphertext);
    const record = JSON.parse(new TextDecoder().decode(bytes));
    if (record.version !== 1 || !record.studentName || !record.courseTitle) throw new Error('Invalid decrypted certificate data.');
    const templateHTML = await templateResponse.text();
    const holder = document.createElement('template');
    holder.innerHTML = templateHTML;
    for (const item of holder.content.querySelectorAll('[data-field]')) {
      const field = item.getAttribute('data-field');
      item.textContent = String(record[field] ?? '');
    }
    outputEl.replaceChildren(holder.content.cloneNode(true));
    outputEl.hidden = false;
    statusEl.hidden = true;
    document.body.classList.add('certificate-ready');
    fitCertificate();
  } catch (err) {
    console.error('Certificate viewer error:', err.name);
    status(err.name === 'OperationError' ? 'Decryption failed: incorrect key or damaged ciphertext.' : `Unable to open certificate: ${err.message}`, true);
  }
}
function fitCertificate() {
  const certificate = outputEl.querySelector('.certificate');
  if (!certificate || outputEl.hidden) return;
  const scale = Math.min(1, outputEl.clientWidth / 1050);
  certificate.style.transform = `scale(${scale})`;
  outputEl.style.height = `${certificate.offsetHeight * scale}px`;
}
window.addEventListener('resize', fitCertificate);
window.addEventListener('hashchange', render);
render();
