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

/**
 * Read a computed `filter` as a number. Chrome reports settled values in
 * scientific notation (`grayscale(3.4e-07)`), so pattern-matching the string
 * gives a gate that fails on a working feature.
 */
const greyLevel = value => {
  if (!value || value === 'none') return 0;
  const match = /grayscale\(([\d.e+-]+)\)/i.exec(value);
  return match ? Number(match[1]) : NaN;
};
const isGrey = value => greyLevel(value) > 0.95;
const isColour = value => greyLevel(value) < 0.05;

// ------------------------------------------------------------- 1440px, fine pointer
await viewport(1440, 900, false);

// Count analysts inside their own section. Deriving them as cards-minus-two
// would make the second half of this gate arithmetically forced.
const roster = await json(`(() => {
  // innerText is the RENDERED text, and the label is CSS-uppercased, so this
  // has to match case-insensitively.
  const section = [...document.querySelectorAll('section')].find(s => /analyst cohort/i.test(s.innerText));
  return {
    cards: document.querySelectorAll('[data-team-card]').length,
    analysts: section ? section.querySelectorAll('[data-team-card]').length : -1,
    label: section ? (section.innerText.match(/(\\d+)\\s+MEMBERS/i) || [])[1] : null,
    gone: ['Gregor', 'Ferrell', 'Maxwell White'].filter(n => document.body.innerText.includes(n)),
    missing: ${JSON.stringify(Object.keys(EXPECTED))}.filter(n => !document.body.innerText.includes(n)),
  };
})()`);
check('roster: 12 cards', roster.cards === 12, `${roster.cards} cards`);
check('roster: 10 analysts in the cohort section', roster.analysts === 10, `${roster.analysts} in section`);
check('roster: the members label agrees', roster.label === '10', `label reads ${roster.label}`);
check('roster: departed members absent', roster.gone.length === 0, roster.gone.join(', '));
check('roster: new members present', roster.missing.length === 0, roster.missing.join(', '));

check('greyscale: grey at rest', isGrey(await filterOf(0)), await filterOf(0));

// A photo-less card has no colour to reveal, so its initials take the accent.
const monoColour = () => json(`(() => {
  const card = [...document.querySelectorAll('[data-team-card]')].find(c => c.innerText.includes('Riley'));
  return getComputedStyle(card.querySelector('span[class*=font-heading]')).color;
})()`);
const monoRest = await monoColour();
await hover(10);
const monoLit = await monoColour();
check('monogram: initials take the accent on engage', monoRest !== monoLit, `${monoRest} -> ${monoLit}`);

const monoText = await json(`[...document.querySelectorAll('[data-team-card]')]
  .filter(c => c.querySelector('span[class*=font-heading]'))
  .map(c => c.querySelector('span[class*=font-heading]').textContent)`);
check('monogram: exactly two, reading RA and GB', JSON.stringify(monoText) === '["RA","GB"]', JSON.stringify(monoText));

// Card 3 is a middle column at both the 3- and 4-column layouts.
const midBox = await hover(3);
const hovered = await filterOf(3);
const neighbour = await filterOf(2);
check('greyscale: hovered card in colour', isColour(hovered), hovered);
check('greyscale: neighbours stay grey', isGrey(neighbour), neighbour);

const onHover = await panel();
check('panel: opens on hover', onHover.found === true, onHover.name);
check('panel: fits viewport (middle column, 1440)', onHover.inside === true, JSON.stringify(onHover.rect));
await shot('team-1440-hover');

await click(midBox);
// Park BEFORE reading aria-expanded. Hover sets it too, and click() never moves
// the pointer — read it with the pointer still on the card and this gate passes
// with the pin deleted entirely.
await park();
const expanded = await json(`document.querySelectorAll('[data-team-card] button[aria-expanded=true]').length`);
check('panel: pins on click', expanded === 1, `${expanded} expanded with the pointer away`);
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

// Every member's LinkedIn button, read from that member's own open panel. The
// card's own name is captured alongside the panel's so a stuck panel — twelve
// identical reads — cannot satisfy the count.
const links = [];
for (let i = 0; i < roster.cards; i += 1) {
  await hover(i);
  links.push(await json(`(() => {
    const card = document.querySelectorAll('[data-team-card]')[${i}];
    const p = document.querySelector('[role=region][id^=panel-]');
    const a = p?.querySelector('a[href*="linkedin.com"]');
    return {
      card: card?.querySelector('button p')?.textContent ?? '(no card)',
      name: p?.querySelector('h2')?.textContent ?? '(no panel)',
      href: a?.getAttribute('href') ?? null,
      target: a?.getAttribute('target') ?? null,
      rel: a?.getAttribute('rel') ?? null,
    };
  })()`));
}
const withLink = links.filter(l => l.href);
const mismatched = links.filter(l => l.name !== l.card);
check('panel: each panel belongs to the card that opened it', mismatched.length === 0,
  mismatched.map(l => `${l.card} -> ${l.name}`).join(', '));
check('linkedin: twelve distinct profiles', new Set(withLink.map(l => l.href)).size === 12,
  `${new Set(withLink.map(l => l.href)).size} distinct`);
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
await hover(1);
const lead1024 = await panel();
check('panel: fits viewport (leadership card, 1024)', lead1024.inside === true, JSON.stringify(lead1024.rect));
await shot('team-1024-hover');

// The fold-out gate has three clauses. Width is covered above; this covers the
// pointer/hover pair, which every other viewport in this file leaves untested —
// without it, `(hover: hover) and (pointer: fine)` could be deleted from the
// component and every gate would still pass.
// Chrome does not emulate `pointer`/`hover` through setEmulatedMedia; touch
// emulation plus a mobile viewport is what actually flips them. A 1024px-wide
// touch device isolates the pointer clause from the width clause.
await viewport(1024, 900, true);
const coarse = await json(`({
  pointer: matchMedia('(pointer: coarse)').matches,
  hover: matchMedia('(hover: none)').matches,
  width: innerWidth,
})`);
check('fold-out: the coarse-pointer emulation actually applied',
  coarse.pointer === true && coarse.hover === true && coarse.width === 1024, JSON.stringify(coarse));
const coarseBox = await hover(3);
check('fold-out: a coarse pointer at 1024px gets no panel', (await panel()).found === false);
await click(coarseBox);
check('fold-out: a coarse pointer at 1024px gets the modal',
  (await json(`document.querySelectorAll('[role=dialog]').length`)) === 1);
await page.send('Emulation.setEmulatedMedia', { features: [] });

// Keyboard path — R10's other half, and the branch the pointer gates never reach.
await viewport(1440, 900, false);
const keyboard = await json(`(() => {
  const card = document.querySelectorAll('[data-team-card]')[3];
  const button = card.querySelector('button');
  card.scrollIntoView({ block: 'center', behavior: 'instant' });
  button.focus();
  return { focused: document.activeElement === button };
})()`);
await pause(600);
const focusPanel = await panel();
check('keyboard: focus alone opens the panel', keyboard.focused && focusPanel.found === true, focusPanel.name);
const focusHeld = await json(`(() => {
  const p = document.querySelector('[role=region][id^=panel-]');
  return { link: !!p?.querySelector('a[href*="linkedin.com"]') };
})()`);
check('keyboard: the focused panel carries its LinkedIn link', focusHeld.link === true);
// Move the pointer somewhere else entirely; the focused panel must survive it.
await page.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: 2, y: 2 });
await pause(400);
check('keyboard: a stray pointer move does not close a focused panel', (await panel()).found === true);
// Escape must hand focus back to the card, not drop it on <body>.
await json(`(() => {
  const a = document.querySelector('[role=region][id^=panel-] a[href*="linkedin.com"]');
  a.focus();
  return { ok: document.activeElement === a };
})()`);
await key('Escape');
const afterEscape = await json(`({
  tag: document.activeElement ? document.activeElement.tagName : null,
  onCard: !!(document.activeElement && document.activeElement.closest('[data-team-card]')),
  panels: document.querySelectorAll('[role=region][id^=panel-]').length,
})`);
check('keyboard: Escape closes the panel', afterEscape.panels === 0);
check('keyboard: Escape returns focus to the card, not the body',
  afterEscape.onCard === true && afterEscape.tag !== 'BODY', JSON.stringify(afterEscape));

// A live resize, without re-navigating, so the matchMedia change handler and the
// side re-measurement actually run. Every other viewport switch here reloads.
const pinBox = await hover(3);
await click(pinBox);
await park();
check('resize: a panel is pinned at 1440', (await panel()).found === true);
await page.send('Emulation.setDeviceMetricsOverride', { width: 900, height: 900, deviceScaleFactor: 1, mobile: false });
await pause(700);
check('resize: crossing below 1024 clears the pinned panel', (await panel()).found === false);
await page.send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
await pause(500);
// Within-band resize: the side must be re-measured, not left stale from open.
const wideBox = await hover(7);
await click(wideBox);
await park();
const beforeShrink = await panel();
await page.send('Emulation.setDeviceMetricsOverride', { width: 1100, height: 900, deviceScaleFactor: 1, mobile: false });
await pause(700);
const afterShrink = await panel();
check('resize: a pinned panel stays in the viewport after a within-band resize',
  beforeShrink.found && afterShrink.found && afterShrink.inside === true,
  `${JSON.stringify(beforeShrink.rect)} -> ${JSON.stringify(afterShrink.rect)}`);
await page.send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });

// ---------------------------------------- 900px, fine pointer, below the floor
await viewport(900, 900, false);
const box900 = await hover(3);
check('fallback: no panel below 1024px', (await panel()).found === false);
await click(box900);
check('fallback: 900px opens the modal', (await json(`document.querySelectorAll('[role=dialog]').length`)) === 1);
await shot('team-900-modal');

// The modal's chrome was rewritten around ProfileBody, so its close paths and
// scroll lock need gating rather than just "a dialog exists".
check('modal: locks body scroll while open',
  (await page.evaluate(`document.body.style.overflow`)) === 'hidden');
await key('Escape');
const afterModalEscape = await json(`({
  dialogs: document.querySelectorAll('[role=dialog]').length,
  overflow: document.body.style.overflow,
})`);
check('modal: Escape closes it', afterModalEscape.dialogs === 0);
check('modal: body scroll is restored', afterModalEscape.overflow !== 'hidden', afterModalEscape.overflow);
await click(await hover(3));
const backdrop = await json(`(() => {
  const b = document.querySelector('[role=dialog] button[aria-label="Close profile"]');
  const r = b.getBoundingClientRect();
  return { x: Math.round(r.left + 8), y: Math.round(r.top + 8) };
})()`);
await click(backdrop);
check('modal: the backdrop closes it',
  (await json(`document.querySelectorAll('[role=dialog]').length`)) === 0);

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
check('touch: the tapped card is in colour', isColour(touch.lit), String(touch.lit));
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
check('reduced motion: colour still changes', isColour(reduced.lit), reduced.lit);
check('reduced motion: panel still opens', reduced.panelFound === true);
await page.send('Emulation.setEmulatedMedia', { features: [] });

check('console: clean', problems.length === 0, problems.slice(0, 4).join(' | '));

await writeFile(`${out}/results.json`, JSON.stringify({ origin, results, problems }, null, 2));
await page.close();

const failed = results.filter(r => !r.pass);
console.log(`\n${results.length - failed.length}/${results.length} gates passed`);
process.exitCode = failed.length ? 1 : 0;
