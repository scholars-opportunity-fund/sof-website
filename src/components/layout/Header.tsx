'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, useRef } from 'react';
import { usePathname } from 'next/navigation';
import styles from './Header.module.css';
import { FUND, MICROCAP, SCHOLARS_URL } from '@/lib/constants';

const panels = {
  overview: { label: 'Overview', title: 'A student-run fund building systematic strategies in public equities.', links: [
    { href: '/approach', title: 'The approach', text: 'How we build and test strategies.' },
    { href: '/process', title: 'Investment process', text: 'Idea, backtest, review, live trading.' },
    { href: '/team', title: 'Leadership', text: 'Dr. Jonathan Brogaard, Chief Investment Officer.' },
  ] },
  process: { label: 'Program', title: 'What student analysts do and how the role grows.', links: [
    { href: '/program#work', title: 'What analysts do', text: 'Research, testing, monitoring and reporting.' },
    { href: '/program#growth', title: 'How responsibility grows', text: 'From first semester to leading a strategy team.' },
  ] },
};

export default function Header() {
  const pathname = usePathname();
  const [menu, setMenu] = useState<keyof typeof panels | null>(null);
  const [mobile, setMobile] = useState(false);
  const [openedOn, setOpenedOn] = useState(pathname);
  // Overview is a link and Program is a button, so this holds either.
  const trigger = useRef<HTMLElement | null>(null);
  // Close the menu when browser navigation changes the route as well as on link clicks.
  if (openedOn !== pathname) { setOpenedOn(pathname); setMenu(null); setMobile(false); }
  const close = () => { setMenu(null); setMobile(false); };
  // The homepage's hero owns the fund's name until the brain hands it up to the header, so the header
  // renders it hidden there rather than painting it and having the hero's script take it away — which
  // flashed the name on every load and made it the page's largest paint.
  const home = pathname === '/';
  return <header className={styles.header} onPointerLeave={event => { if (event.pointerType === 'mouse') setMenu(null); }}
    onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) close(); }}
    onKeyDown={event => { if (event.key === 'Escape') { close(); trigger.current?.focus(); } }}>
    <div className={styles.inner}>
      <Link href="/" aria-label="Scholars Opportunity Fund home" className={styles.brand} onClick={close}><Image src="/brand/logo-on-light.png" alt="" width={44} height={44} priority /><span data-nav-word style={home ? { opacity: 0 } : undefined}>{FUND.name}</span></Link>
      <button type="button" data-menu-toggle className={styles.mobileToggle} aria-label={mobile ? 'Close menu' : 'Open menu'} aria-expanded={mobile} aria-controls="signal-navigation" onClick={event => { trigger.current = event.currentTarget; if (mobile) close(); else setMobile(true); }}> {mobile ? 'Close ×' : 'Menu +'} </button>
      <nav id="signal-navigation" className={styles.nav} data-open={mobile} aria-label="Main navigation">
        <Link href="/" aria-expanded={menu === 'overview'} aria-controls="overview-panel" onPointerEnter={event => { if (event.pointerType === 'mouse') { trigger.current = event.currentTarget; setMenu('overview'); } }} onFocus={event => { trigger.current = event.currentTarget; setMenu('overview'); }} onClick={close}>Overview <small>▾</small></Link>
        <Link href="/team" onPointerEnter={() => setMenu(null)} onClick={close}>Team</Link>
        <button type="button" aria-expanded={menu === 'process'} aria-controls="process-panel" onPointerEnter={event => { if (event.pointerType === 'mouse') { trigger.current = event.currentTarget; setMenu('process'); } }} onClick={event => { trigger.current = event.currentTarget; setMenu(menu === 'process' ? null : 'process'); }}>Program <small>▾</small></button>
        <a href={MICROCAP.href} className={styles.highlight} onPointerEnter={() => setMenu(null)} onClick={close}>{MICROCAP.shortLabel}</a>
        <a href={SCHOLARS_URL} onPointerEnter={() => setMenu(null)} onClick={close}>SOF Scholars</a>
        <a href={`mailto:${FUND.contactEmail}`} onPointerEnter={() => setMenu(null)} onClick={close}>Contact</a>
        <Link href="/program#apply" className={styles.apply} onPointerEnter={() => setMenu(null)} onClick={close}>Apply</Link>
      </nav>
    </div>
    <noscript><style>{`[data-menu-toggle],#signal-navigation{display:none!important}[data-nav-word]{opacity:1!important}`}</style><nav className={styles.noScriptNav} aria-label="Main navigation without JavaScript"><Link href="/">Overview</Link><Link href="/team">Team</Link><Link href="/program">Program</Link><a href={MICROCAP.href}>{MICROCAP.shortLabel}</a><a href={SCHOLARS_URL}>SOF Scholars</a><a href={`mailto:${FUND.contactEmail}`}>Contact</a><Link href="/program#apply">Apply</Link></nav></noscript>
    {(Object.keys(panels) as (keyof typeof panels)[]).map(key => <div key={key} id={`${key}-panel`} className={styles.panel} hidden={menu !== key}><div className={styles.panelInner}>
      <div><p>{panels[key].label}</p><h3>{panels[key].title}</h3></div>
      {panels[key].links.map(link => <Link key={link.href} href={link.href} onClick={close}><strong>{link.title}</strong><span>{link.text}</span></Link>)}
    </div></div>)}
  </header>;
}
