// Browser gates for the team page: roster, greyscale, the fold-out panel, the
// LinkedIn buttons, and the modal fallback.
//
// Usage: node design/team/qa/capture-team.mjs [origin]
// Needs a debug Chrome on 127.0.0.1:9223 and the site served at `origin`.
//
// Note on the LinkedIn gate: only one disclosure is open at a time, so the
// twelve buttons never coexist in the DOM. The gate walks the cards and reads
// each member's link from their own open panel.
import { openPage, until, pause } from '../../brain/qa/cdp.mjs';
import { writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const origin = process.argv[2] || 'http://127.0.0.1:3100';
// fileURLToPath, not .pathname — this repo's path has spaces in it, and
// .pathname hands back the percent-encoded form.
const out = fileURLToPath(new URL('.', import.meta.url));
await mkdir(out, { recursive: true });

/** The three new members, whose URLs must match the request character for character. */
const EXPECTED = {
  'John Pary': 'https://www.linkedin.com/in/john-pary-bb93b7359/',
  'Riley Fontanos Alfonso': 'https://www.linkedin.com/in/rileyfontanosalfonso/',
  'Greyson Bailey': 'https://www.linkedin.com/in/greyson-w-bailey/',
};

const results = [];
const check = (name, pass, detail) => {
  results.push({ name, pass, detail: detail ?? '' });
  console.log(`${pass ? 'PASS' : 'FAIL'}  ${name}${detail ? `  — ${detail}` : ''}`);
};

const page = await openPage();
const problems = [];
page.on('Runtime.consoleAPICalled', e => {
  const text = e.args.map(a => a.value ?? a.description ?? '').join(' ');
  if (/hydrat|warning|error/i.test(text)) problems.push(`${e.type}: ${text.slice(0, 160)}`);
});
page.on('Runtime.exceptionThrown', e =>
  problems.push('EXCEPTION: ' + (e.exceptionDetails.exception?.description ?? e.exceptionDetails.text).slice(0, 200)));
page.on('Network.responseReceived', e => {
  if (e.response.status === 404) problems.push(`404: ${e.response.url}`);
});
await page.send('Network.enable');
await page.send('Page.bringToFront');
await page.send('Emulation.setScrollbarsHidden', { hidden: true });

const json = async expression => JSON.parse(await page.evaluate(`JSON.stringify(${expression})`));

const shot = async name => {
  const data = (await page.send('Page.captureScreenshot', { format: 'png' })).data;
  await writeFile(`${out}/${name}.png`, Buffer.from(data, 'base64'));
};

const viewport = async (width, height, touch) => {
  await page.send('Emulation.setDeviceMetricsOverride', {
    width, height, deviceScaleFactor: 1, mobile: !!touch,
  });
  await page.send('Emulation.setTouchEmulationEnabled', { enabled: !!touch });
  await page.send('Page.navigate', { url: `${origin}/team` });
  await until(page, `document.querySelectorAll('[data-team-card]').length > 0`, 60000);
  await pause(1000);
};

/** Move the pointer off every card so any open preview unmounts first. */
const park = async () => {
  await page.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: 2, y: 2 });
  await pause(250);
};

/**
 * Scroll card `index` into view, then park the pointer on it.
 *
 * Two things this has to get right. The scroll matters because otherwise the
 * coordinates land outside the viewport and every event misses. Parking first
 * matters because an open panel deliberately covers the neighbouring card — so
 * moving straight from one card to the next lands inside the previous card's
 * panel, and the preview never changes.
 */
const hover = async index => {
  await park();
  const box = await json(`(() => {
    const card = document.querySelectorAll('[data-team-card]')[${index}];
    card.scrollIntoView({ block: 'center', behavior: 'instant' });
    const r = card.getBoundingClientRect();
    return { x: Math.round(r.left + r.width / 2), y: Math.round(r.top + 30) };
  })()`);
  await page.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: box.x, y: box.y });
  // The greyscale transition runs 500ms; sample after it has settled.
  await pause(700);
  return box;
};

const click = async box => {
  for (const type of ['mousePressed', 'mouseReleased']) {
    await page.send('Input.dispatchMouseEvent', {
      type, x: box.x, y: box.y, button: 'left', buttons: 1, clickCount: 1,
    });
  }
  await pause(500);
};

const key = async name => {
  await page.send('Input.dispatchKeyEvent', {
    type: 'keyDown', key: name, code: name, windowsVirtualKeyCode: 27,
  });
  await page.send('Input.dispatchKeyEvent', { type: 'keyUp', key: name, code: name });
  await pause(400);
};

const panel = () => json(`(() => {
  const p = document.querySelector('[role=region][id^=panel-]');
  if (!p) return { found: false };
  const r = p.getBoundingClientRect();
  return {
    found: true,
    name: p.querySelector('h2')?.textContent ?? '',
    inside: r.left >= 0 && r.right <= window.innerWidth,
    rect: [Math.round(r.left), Math.round(r.right), window.innerWidth],
  };
})()`);

const filterOf = index => page.evaluate(
  `getComputedStyle(document.querySelectorAll('[data-team-card]')[${index}].querySelector('button > div')).filter`);

// ------------------------------------------------------------- 1440px, fine pointer
await viewport(1440, 900, false);

const roster = await json(`(() => ({
  cards: document.querySelectorAll('[data-team-card]').length,
  analysts: document.querySelectorAll('[data-team-card]').length - 2,
  gone: ['Gregor', 'Ferrell', 'Maxwell White'].filter(n => document.body.innerText.includes(n)),
  missing: ${JSON.stringify(Object.keys(EXPECTED))}.filter(n => !document.body.innerText.includes(n)),
}))()`);
check('roster: 12 cards, 10 analysts', roster.cards === 12 && roster.analysts === 10, `${roster.cards} cards`);
check('roster: departed members absent', roster.gone.length === 0, roster.gone.join(', '));
check('roster: new members present', roster.missing.length === 0, roster.missing.join(', '));

check('greyscale: grey at rest', /grayscale\(1\)/.test(await filterOf(0)), await filterOf(0));

// A photo-less card has no colour to reveal, so its initials take the accent.
const monoColour = () => json(`(() => {
  const card = [...document.querySelectorAll('[data-team-card]')].find(c => c.innerText.includes('Riley'));
  return getComputedStyle(card.querySelector('span[class*=font-heading]')).color;
})()`);
const monoRest = await monoColour();
await hover(10);
const monoLit = await monoColour();
check('monogram: initials take the accent on engage', monoRest !== monoLit, `${monoRest} -> ${monoLit}`);

// Card 3 is a middle column at both the 3- and 4-column layouts.
const midBox = await hover(3);
const hovered = await filterOf(3);
const neighbour = await filterOf(2);
check('greyscale: hovered card in colour', /grayscale\((0|0\.0\d+)\)|none/.test(hovered), hovered);
check('greyscale: neighbours stay grey', /grayscale\(1\)/.test(neighbour), neighbour);

const onHover = await panel();
check('panel: opens on hover', onHover.found === true, onHover.name);
check('panel: fits viewport (middle column, 1440)', onHover.inside === true, JSON.stringify(onHover.rect));
await shot('team-1440-hover');

await click(midBox);
const expanded = await json(`document.querySelectorAll('[data-team-card] button[aria-expanded=true]').length`);
check('panel: pins on click', expanded === 1, `${expanded} expanded`);
// Drop the pointer off the card without scrolling — scrolling to another card
// would carry the pinned panel out of the viewport and make the hit test below
// meaningless.
await park();
const stillPinned = await panel();
check('panel: pin survives the pointer leaving', stillPinned.found === true, stillPinned.name);

const linkHit = await page.evaluate(`(() => {
  const a = document.querySelector('[role=region][id^=panel-] a[href*="linkedin"]');
  if (!a) return 'no-link';
  const r = a.getBoundingClientRect();
  const top = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
  return a === top || a.contains(top) ? 'hit' : 'occluded';
})()`);
check('panel: LinkedIn button is hit-testable while pinned', linkHit === 'hit', linkHit);
await shot('team-1440-pinned');

const reBox = await hover(3);
await click(reBox);
check('panel: a second click closes it', (await panel()).found === false);

await hover(4);
check('panel: hover reopens after unpinning', (await panel()).found === true);
await key('Escape');
check('panel: Escape dismisses a hover preview', (await panel()).found === false);

// Every member's LinkedIn button, read from that member's own open panel.
const links = [];
for (let i = 0; i < roster.cards; i += 1) {
  await hover(i);
  links.push(await json(`(() => {
    const p = document.querySelector('[role=region][id^=panel-]');
    const a = p?.querySelector('a[href*="linkedin.com"]');
    return {
      name: p?.querySelector('h2')?.textContent ?? '(no panel)',
      href: a?.getAttribute('href') ?? null,
      target: a?.getAttribute('target') ?? null,
      rel: a?.getAttribute('rel') ?? null,
    };
  })()`));
}
const withLink = links.filter(l => l.href);
const unsafe = withLink.filter(l => l.target !== '_blank' || !/noopener/.test(l.rel ?? ''));
const wrong = Object.entries(EXPECTED)
  .filter(([name, href]) => links.find(l => l.name === name)?.href !== href)
  .map(([name]) => name);
check('linkedin: twelve buttons', withLink.length === 12, `${withLink.length} of ${links.length} panels carried a link`);
check('linkedin: the three new URLs match exactly', wrong.length === 0, wrong.join(', '));
check('linkedin: all open safely in a new tab', unsafe.length === 0, unsafe.map(l => l.name).join(', '));

// ---------------------------------------------------- 1024px, the fold-out floor
await viewport(1024, 900, false);
await hover(5);
const last1024 = await panel();
check('panel: fits viewport (last column, 1024)', last1024.inside === true, JSON.stringify(last1024.rect));
await hover(4);
const mid1024 = await panel();
check('panel: fits viewport (middle column, 1024)', mid1024.inside === true, JSON.stringify(mid1024.rect));
await shot('team-1024-hover');

// ---------------------------------------- 900px, fine pointer, below the floor
await viewport(900, 900, false);
const box900 = await hover(3);
check('fallback: no panel below 1024px', (await panel()).found === false);
await click(box900);
check('fallback: 900px opens the modal', (await json(`document.querySelectorAll('[role=dialog]').length`)) === 1);
await shot('team-900-modal');

// ------------------------------------------------------------- 390px, touch
await viewport(390, 844, true);
const box390 = await hover(3);
await click(box390);
const touch = await json(`(() => {
  const card = document.querySelector('[data-team-card][data-lit=true]');
  return {
    dialog: document.querySelectorAll('[role=dialog]').length,
    panel: document.querySelectorAll('[role=region][id^=panel-]').length,
    lit: card ? getComputedStyle(card.querySelector('button > div')).filter : null,
    link: document.querySelector('[role=dialog] a[href*="linkedin.com"]')?.getAttribute('href') ?? null,
  };
})()`);
check('fallback: touch opens the modal', touch.dialog === 1, JSON.stringify(touch));
check('fallback: touch mounts no panel', touch.panel === 0);
check('touch: the tapped card is in colour', /grayscale\((0|0\.0\d+)\)|none/.test(touch.lit ?? ''), String(touch.lit));
check('fallback: the modal carries the LinkedIn button', !!touch.link?.includes('linkedin.com'), String(touch.link));
await shot('team-390-modal');

// ------------------------------------------- reduced motion, at 1440px again
await page.send('Emulation.setEmulatedMedia', {
  features: [{ name: 'prefers-reduced-motion', value: 'reduce' }],
});
await viewport(1440, 900, false);
await hover(3);
const reduced = await json(`(() => {
  const card = document.querySelectorAll('[data-team-card]')[3];
  const tile = card.querySelector('button > div');
  const p = document.querySelector('[role=region][id^=panel-]');
  // transition-none zeroes transition-property, not duration, so that is the
  // property worth asserting on.
  return {
    tileTransition: getComputedStyle(tile).transitionProperty,
    lit: getComputedStyle(tile).filter,
    panelTransition: p ? getComputedStyle(p).transitionProperty : null,
    panelFound: !!p,
  };
})()`);
check('reduced motion: no card transition', reduced.tileTransition === 'none', reduced.tileTransition);
check('reduced motion: no panel transition', reduced.panelTransition === null || reduced.panelTransition === 'none', String(reduced.panelTransition));
check('reduced motion: colour still changes', /grayscale\(0\)|none/.test(reduced.lit), reduced.lit);
check('reduced motion: panel still opens', reduced.panelFound === true);
await page.send('Emulation.setEmulatedMedia', { features: [] });

check('console: clean', problems.length === 0, problems.slice(0, 4).join(' | '));

await writeFile(`${out}/results.json`, JSON.stringify({ origin, results, problems }, null, 2));
await page.close();

const failed = results.filter(r => !r.pass);
console.log(`\n${results.length - failed.length}/${results.length} gates passed`);
process.exitCode = failed.length ? 1 : 0;
