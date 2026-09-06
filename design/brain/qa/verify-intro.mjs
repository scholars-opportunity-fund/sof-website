import { openPage, until, pause } from './cdp.mjs';
import { writeFile, mkdir } from 'node:fs/promises';
const out = process.argv[2] || 'design/brain/qa/intro';
const base = process.argv[3] || 'http://127.0.0.1:3000';
await mkdir(out, { recursive: true });
const shot = async (p, name) => writeFile(`${out}/${name}.png`, Buffer.from((await p.send('Page.captureScreenshot')).data, 'base64'));
const state = p => p.evaluate(`({phase:document.querySelector('[data-brain-home]').dataset.brainPhase, ready:document.querySelector('[data-brain-canvas]').dataset.ready, failed:document.querySelector('[data-brain-home]').dataset.brainFailed, formation:document.querySelector('[data-brain-canvas]').dataset.formation, fallbackShown:!document.querySelector('[data-brain-fallback]').hidden})`);

// 1. Console errors on a normal load.
{
  const p = await openPage();
  const logs = [];
  p.on('Runtime.consoleAPICalled', e => { if (['error', 'warning'].includes(e.type)) logs.push(`${e.type}: ${e.args.map(a => a.value ?? a.description ?? '').join(' ').slice(0, 400)}`); });
  p.on('Runtime.exceptionThrown', e => logs.push(`exception: ${e.exceptionDetails.exception?.description?.slice(0, 400) ?? e.exceptionDetails.text}`));
  await p.send('Page.bringToFront');
  await p.send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false });
  await p.send('Page.navigate', { url: base });
  await until(p, `document.querySelector('[data-brain-home][data-brain-phase=still]')`, 40000);
  console.log('console:', JSON.stringify(logs, null, 1));
  await p.close();
}

// 2. Slow model: hold the GLB request for 9 seconds; the intro should pause at 5s and resume.
{
  const p = await openPage();
  await p.send('Page.bringToFront');
  await p.send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false });
  await p.send('Network.enable');
  await p.send('Fetch.enable', { patterns: [{ urlPattern: '*anatomical-brain.glb.gz*', requestStage: 'Request' }] });
  let release;
  const held = new Promise(resolve => { release = resolve; });
  p.on('Fetch.requestPaused', async e => { await held; await p.send('Fetch.continueRequest', { requestId: e.requestId }); });
  await p.send('Page.navigate', { url: base });
  await until(p, `document.querySelector('[data-brain-home][data-brain-phase=forming]')`);
  const t0 = Date.now();
  await pause(4000); await shot(p, 'hold-4s'); console.log('hold 4s', JSON.stringify(await state(p)));
  await pause(4000); await shot(p, 'hold-8s'); console.log('hold 8s', JSON.stringify(await state(p)));
  release();
  await until(p, `document.querySelector('[data-brain-canvas][data-ready=true]')`);
  console.log('released after', Date.now() - t0, JSON.stringify(await state(p)));
  await pause(3500); await shot(p, 'hold-resume'); console.log('resume', JSON.stringify(await state(p)));
  await until(p, `document.querySelector('[data-brain-home][data-brain-phase=still]')`, 30000);
  await pause(300); await shot(p, 'hold-rest'); console.log('rest', JSON.stringify(await state(p)));
  await p.close();
}

// 3. Failed model: block the GLB; the still image fallback must appear and the page stays usable.
{
  const p = await openPage();
  await p.send('Page.bringToFront');
  await p.send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false });
  await p.send('Fetch.enable', { patterns: [{ urlPattern: '*anatomical-brain.glb.gz*', requestStage: 'Request' }] });
  p.on('Fetch.requestPaused', e => p.send('Fetch.failRequest', { requestId: e.requestId, errorReason: 'Failed' }));
  await p.send('Page.navigate', { url: base });
  await until(p, `document.querySelector('[data-brain-home][data-brain-failed=true]')`, 30000);
  await pause(600); await shot(p, 'failed'); console.log('failed', JSON.stringify(await state(p)));
  await p.close();
}

// 4. Mobile rest and explore.
{
  const p = await openPage();
  await p.send('Page.bringToFront');
  await p.send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });
  await p.send('Page.navigate', { url: base });
  await until(p, `document.querySelector('[data-brain-home][data-brain-phase=forming]')`);
  await pause(3000); await shot(p, 'mobile-forming');
  await until(p, `document.querySelector('[data-brain-home][data-brain-phase=still]')`, 30000);
  await pause(300); await shot(p, 'mobile-rest');
  await p.evaluate(`scrollTo({top:380,behavior:'instant'})`); await pause(600); await shot(p, 'mobile-explore');
  console.log('mobile', JSON.stringify(await state(p)), await p.evaluate(`document.documentElement.scrollWidth>innerWidth`));
  await p.close();
}
