'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, useRef } from 'react';
import { usePathname } from 'next/navigation';
import styles from './Header.module.css';
import { FUND } from '@/lib/constants';

const panels = {
  overview: { label: 'Overview', title: 'A student-run event-driven fund in public equities.', links: [
    { href: '/about#approach', title: 'The approach', text: 'Catalysts, special situations, uneven coverage.' },
    { href: '/about#fund-structure', title: 'Fund structure', text: 'Independently operated. Every decision routes through the CIO.' },
    { href: '/team', title: 'Leadership', text: 'Dr. Jonathan Brogaard, Chief Investment Officer.' },
  ] },
  process: { label: 'Process', title: 'From sourcing to decision, documented end to end.', links: [
    { href: '/program#work', title: 'What analysts do', text: 'Candidate analysis, monitoring, LP reporting inputs.' },
    { href: '/program#week', title: 'A week in the life', text: 'Monday sourcing digest to Friday memo handoff.' },
    { href: '/program#growth', title: 'How responsibility grows', text: 'Up to 12 hrs/week. Multi-semester. Scope grows with judgment.' },
  ] },
};

export default function Header() {
  const pathname = usePathname();
  const [menu, setMenu] = useState<keyof typeof panels | null>(null);
  const [mobile, setMobile] = useState(false);
  const [openedOn, setOpenedOn] = useState(pathname);
  const trigger = useRef<HTMLButtonElement | null>(null);
  // Close the menu when browser navigation changes the route as well as on link clicks.
  if (openedOn !== pathname) { setOpenedOn(pathname); setMenu(null); setMobile(false); }
  const close = () => { setMenu(null); setMobile(false); };
  return <header className={styles.header} onPointerLeave={event => { if (event.pointerType === 'mouse') setMenu(null); }}
    onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) close(); }}
    onKeyDown={event => { if (event.key === 'Escape') { close(); trigger.current?.focus(); } }}>
    <div className={styles.inner}>
      <Link href="/" aria-label="Scholars Opportunity Fund home" className={styles.brand} onClick={close}><Image src="/brand/logo-on-light.png" alt="" width={44} height={44} priority /><span data-nav-word>{FUND.name}</span></Link>
      <button type="button" data-menu-toggle className={styles.mobileToggle} aria-label={mobile ? 'Close menu' : 'Open menu'} aria-expanded={mobile} aria-controls="signal-navigation" onClick={event => { trigger.current = event.currentTarget; if (mobile) close(); else setMobile(true); }}> {mobile ? 'Close ×' : 'Menu +'} </button>
      <nav id="signal-navigation" className={styles.nav} data-open={mobile} aria-label="Main navigation">
        <button type="button" aria-expanded={menu === 'overview'} aria-controls="overview-panel" onPointerEnter={event => { if (event.pointerType === 'mouse') { trigger.current = event.currentTarget; setMenu('overview'); } }} onClick={event => { trigger.current = event.currentTarget; setMenu(menu === 'overview' ? null : 'overview'); }}>Overview <small>▾</small></button>
        <Link href="/team" onPointerEnter={() => setMenu(null)} onClick={close}>Team</Link>
        <button type="button" aria-expanded={menu === 'process'} aria-controls="process-panel" onPointerEnter={event => { if (event.pointerType === 'mouse') { trigger.current = event.currentTarget; setMenu('process'); } }} onClick={event => { trigger.current = event.currentTarget; setMenu(menu === 'process' ? null : 'process'); }}>Process <small>▾</small></button>
        <a href={`mailto:${FUND.contactEmail}`} onPointerEnter={() => setMenu(null)} onClick={close}>Contact</a>
        <Link href="/program#apply" className={styles.apply} onPointerEnter={() => setMenu(null)} onClick={close}>Apply</Link>
      </nav>
    </div>
    <noscript><style>{`[data-menu-toggle],#signal-navigation{display:none!important}`}</style><nav className={styles.noScriptNav} aria-label="Main navigation without JavaScript"><Link href="/about">Overview</Link><Link href="/team">Team</Link><Link href="/program">Process</Link><a href={`mailto:${FUND.contactEmail}`}>Contact</a><Link href="/program#apply">Apply</Link></nav></noscript>
    {(Object.keys(panels) as (keyof typeof panels)[]).map(key => <div key={key} id={`${key}-panel`} className={styles.panel} hidden={menu !== key}><div className={styles.panelInner}>
      <div><p>{panels[key].label}</p><h3>{panels[key].title}</h3></div>
      {panels[key].links.map(link => <Link key={link.href} href={link.href} onClick={close}><strong>{link.title}</strong><span>{link.text}</span></Link>)}
    </div></div>)}
  </header>;
}
