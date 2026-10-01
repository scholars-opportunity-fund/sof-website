'use client';

import { useEffect, useRef, useState } from 'react';
import { PROCESS_STEPS as steps } from './process-steps';
import styles from './Signal.module.css';

export default function SignalProcess() {
  const rail = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState(1);
  useEffect(() => {
    let frame = 0;
    function update() {
      frame = 0;
      if (!rail.current) return;
      const box = rail.current.getBoundingClientRect();
      rail.current.style.setProperty('--fill', `${Math.min(1, Math.max(0, (innerHeight * .6 - box.top) / box.height)) * 100}%`);
      let current = 1;
      rail.current.querySelectorAll('li').forEach((item, index) => { if (item.getBoundingClientRect().top < innerHeight * .6) current = index + 1; });
      setStep(current);
    }
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    schedule(); window.addEventListener('scroll', schedule, { passive: true }); window.addEventListener('resize', schedule);
    return () => { cancelAnimationFrame(frame); window.removeEventListener('scroll', schedule); window.removeEventListener('resize', schedule); };
  }, []);
  return <section id="pipeline" className={`${styles.section} ${styles.process}`}><div className={styles.grid}>
    <div className={styles.sticky}><p className={styles.kicker}>Investment process</p><h2>From sourcing to decision</h2><p className={styles.muted}>A disciplined pipeline with clear accountability at every stage.</p><p className={styles.counter}>0{step}<span> / 04</span></p></div>
    <div ref={rail} className={styles.rail} data-rail><ol>{steps.map((item, index) => <li key={item.title} data-active={index < step}>
      <span className={styles.cubeWrap} aria-hidden="true"><span className={styles.cube}>{['front', 'back', 'right', 'left', 'top', 'bottom'].map(face => <span key={face} />)}</span></span>
      <p className={styles.kicker}>0{index + 1}</p><h3>{item.title}</h3><p>{item.text}</p><p className={styles.meta}>{item.meta}</p>
    </li>)}</ol></div>
  </div></section>;
}
