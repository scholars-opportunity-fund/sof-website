export async function openPage() {
  const response = await fetch('http://127.0.0.1:9223/json/new?about:blank', { method: 'PUT' });
  const target = await response.json();
  const socket = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    socket.addEventListener('open', resolve, { once: true });
    socket.addEventListener('error', reject, { once: true });
  });
  let sequence = 0;
  const pending = new Map();
  const events = new Map();
  socket.addEventListener('message', event => {
    const message = JSON.parse(event.data);
    if (message.method) { events.get(message.method)?.forEach(listener => listener(message.params)); return; }
    const request = pending.get(message.id);
    if (!request) return;
    pending.delete(message.id);
    clearTimeout(request.timer);
    if (message.error) request.reject(new Error(JSON.stringify(message.error)));
    else request.resolve(message.result);
  });
  const send = (method, params = {}) => new Promise((resolve, reject) => {
    const id = ++sequence;
    const timer = setTimeout(() => { pending.delete(id); reject(new Error(`CDP timeout: ${method}`)); }, 30000);
    pending.set(id, { resolve, reject, timer });
    socket.send(JSON.stringify({ id, method, params }));
  });
  await send('Page.enable');
  await send('Runtime.enable');
  const evaluate = async expression => {
    const result = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
    if (result.exceptionDetails) throw new Error(JSON.stringify(result.exceptionDetails));
    return result.result.value;
  };
  const on = (method, listener) => {
    if (!events.has(method)) events.set(method, new Set());
    events.get(method).add(listener);
    return () => events.get(method)?.delete(listener);
  };
  return { send, evaluate, on, close: async () => {
    socket.close();
    await fetch(`http://127.0.0.1:9223/json/close/${target.id}`);
  } };
}

export const pause = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds));
export async function until(page, expression, timeout = 30000) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    if (await page.evaluate(`Boolean(${expression})`)) return;
    await pause(200);
  }
  throw new Error(`Condition not reached: ${expression}`);
}
