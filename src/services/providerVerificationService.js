import { sharedGet } from './sharedGet';

// Batch badges on the same screen and share pending reads, including StrictMode replays.
const pending = new Map();
let scheduled = false;

async function flush() {
  scheduled = false;
  const entries = [...pending.entries()].filter(([, item]) => !item.started).slice(0, 100);
  if (!entries.length) return;
  for (const [, item] of entries) item.started = true;
  try {
    const response = await sharedGet('/provider-verifications', {
      user_ids: entries.map(([id]) => Number(id)),
    });
    const records = new Map(response.data.map((record) => [String(record.user_id), record]));
    for (const [id, item] of entries) item.resolve(records.get(id) || null);
  } catch (error) {
    for (const [, item] of entries) item.reject(error);
  } finally {
    for (const [id] of entries) pending.delete(id);
    if ([...pending.values()].some((item) => !item.started) && !scheduled) {
      scheduled = true;
      setTimeout(flush, 0);
    }
  }
}

export function getProviderVerification(userId) {
  const id = String(userId ?? '');
  if (!/^[1-9]\d*$/.test(id)) return Promise.resolve(null);
  if (pending.has(id)) return pending.get(id).promise;
  const item = { started: false };
  item.promise = new Promise((resolve, reject) => {
    item.resolve = resolve;
    item.reject = reject;
  });
  pending.set(id, item);
  if (!scheduled) {
    scheduled = true;
    setTimeout(flush, 0);
  }
  return item.promise;
}
