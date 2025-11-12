const atMidnightLocal = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

export function daysUntil(endIso) {
  if (!endIso) return null;
  const today = atMidnightLocal(new Date());
  const end = atMidnightLocal(new Date(endIso));
  const diffMs = end.getTime() - today.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

const DISMISS_PREFIX = 'plan-expiry-dismissed-';

function dismissKey(endIso) {
  return `${DISMISS_PREFIX}${endIso || 'unknown'}`;
}

export function isDismissedForToday(endIso) {
  const key = dismissKey(endIso);
  const stored = localStorage.getItem(key);
  if (!stored) return false;
  const today = atMidnightLocal(new Date());
  const stamp = `${today.getFullYear()}-${today.getMonth()+1}-${today.getDate()}`;
  return stored === stamp;
}

export function dismissForToday(endIso) {
  const key = dismissKey(endIso);
  const today = atMidnightLocal(new Date());
  const stamp = `${today.getFullYear()}-${today.getMonth()+1}-${today.getDate()}`;
  localStorage.setItem(key, stamp);
}

export function formatDateLocal(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('es-PE', { year: 'numeric', month: 'short', day: '2-digit' });
}

export function isNoExpiry(plan) {
  if (!plan) return false;
  const type = (plan.planType || '').toUpperCase();
  if (type === 'FREE') return true; // Free => sin vencimiento

  if (plan.startDate && plan.endDate) {
    const startY = new Date(plan.startDate).getFullYear();
    const endY = new Date(plan.endDate).getFullYear();
    if (!isNaN(startY) && !isNaN(endY) && (endY - startY) > 100) return true;
  }
  return false;
}