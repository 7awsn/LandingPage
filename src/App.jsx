import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useMotionValue,
  useInView,
  AnimatePresence,
} from 'framer-motion';
import Lenis from 'lenis';

const TICKS = [
  ['-top-[6px]', '-left-[6px]'],
  ['-top-[6px]', '-right-[6px]'],
  ['-bottom-[6px]', '-left-[6px]'],
  ['-bottom-[6px]', '-right-[6px]'],
];

function Corners({ color = 'text-[#ff2d4f]' }) {
  return (
    <>
      {TICKS.map((c, i) => (
        <span
          key={i}
          className={`pointer-events-none absolute ${c[0]} ${c[1]} ${color} text-sm leading-none select-none`}
        >
          +
        </span>
      ))}
    </>
  );
}

function useClock() {
  const [t, setT] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setT(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return t;
}

function Cursor() {
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const rx = useSpring(x, { stiffness: 380, damping: 30, mass: 0.4 });
  const ry = useSpring(y, { stiffness: 380, damping: 30, mass: 0.4 });
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (window.matchMedia('(pointer: coarse)').matches) return;
    const move = (e) => {
      x.set(e.clientX);
      y.set(e.clientY);
      setActive(!!e.target.closest('a, button, [data-hover]'));
    };
    window.addEventListener('mousemove', move);
    return () => window.removeEventListener('mousemove', move);
  }, [x, y]);

  return (
    <>
      <motion.div
        className="fixed top-0 left-0 z-[120] rounded-full bg-[#ff2d4f] pointer-events-none"
        style={{ x, y, width: 6, height: 6, translateX: '-50%', translateY: '-50%' }}
      />
      <motion.div
        className="fixed top-0 left-0 z-[120] rounded-full border border-[#ff2d4f]/60 pointer-events-none"
        style={{ x: rx, y: ry, translateX: '-50%', translateY: '-50%' }}
        animate={{ width: active ? 44 : 26, height: active ? 44 : 26, opacity: active ? 1 : 0.5 }}
        transition={{ type: 'spring', stiffness: 300, damping: 22 }}
      />
    </>
  );
}


function Typewriter({ lines, speed = 16 }) {
  const total = useMemo(() => lines.reduce((a, l) => a + l.text.length, 0), [lines]);
  const [n, setN] = useState(0);

  useEffect(() => {
    if (n >= total) return;
    const id = setTimeout(() => setN((v) => v + 1), speed);
    return () => clearTimeout(id);
  }, [n, total, speed]);

  let acc = 0;
  return (
    <div className="space-y-1.5">
      {lines.map((line, i) => {
        const start = acc;
        acc += line.text.length;
        if (n <= start && start !== 0) return null;
        const revealed = Math.max(0, Math.min(line.text.length, n - start));
        const typing = n > start && n < acc;
        const isLast = i === lines.length - 1;
        return (
          <div key={i} className="flex" style={{ color: line.color || '#8a8a94' }}>
            <span className="whitespace-pre-wrap break-all">{line.text.slice(0, revealed)}</span>
            {(typing || (isLast && n >= total)) && <span className="caret" />}
          </div>
        );
      })}
    </div>
  );
}

// Contador que anima de 0 até o valor quando entra na tela.
function Stat({ value, format, label }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  const [n, setN] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let raf;
    const t0 = performance.now();
    const tick = (t) => {
      const p = Math.min(1, (t - t0) / 1700);
      setN(value * (1 - Math.pow(2, -10 * p)));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, value]);

  return (
    <div ref={ref}>
      <div className="font-display text-5xl md:text-6xl font-bold tracking-tighter text-white">
        {format(n)}
      </div>
      <div className="mt-3 text-sm text-white/55 max-w-[16ch]">{label}</div>
    </div>
  );
}

function SectionHead({ n, label, plain }) {
  return (
    <div className="mb-14">
      <div className="flex items-center gap-4 text-xs tracking-[0.2em] uppercase text-white/40">
        <span className="text-[#ff2d4f]">[{n}]</span>
        <span>{label}</span>
        <span className="flex-1 h-px bg-white/10" />
      </div>
      {plain && (
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mt-6 font-display text-3xl md:text-4xl font-semibold tracking-tight max-w-2xl"
        >
          {plain}
        </motion.p>
      )}
    </div>
  );
}

const onSpot = (e) => {
  const r = e.currentTarget.getBoundingClientRect();
  e.currentTarget.style.setProperty('--mx', `${e.clientX - r.left}px`);
  e.currentTarget.style.setProperty('--my', `${e.clientY - r.top}px`);
};

const BOOT = [
  { text: '$ ssh root@0day.sh', color: '#e6e6e9' },
  { text: '[ ok ] canal cifrado — aes-256-gcm', color: '#3ddc84' },
  { text: '$ ./recon --target empresa.exemplo', color: '#e6e6e9' },
  { text: '  > mapeando o que está exposto ....... ok', color: '#8a8a94' },
  { text: '  > 38 portas abertas encontradas', color: '#8a8a94' },
  { text: '  > brecha crítica localizada ...... [!]', color: '#ff2d4f' },
  { text: '[ ok ] acesso obtido em 4.2s', color: '#3ddc84' },
  { text: '$ _', color: '#e6e6e9' },
];

const SERVICES = [
  {
    id: '01',
    title: 'Red Team',
    plain: 'Ataque simulado completo',
    desc: 'A gente age como um invasor de verdade — sem aviso — pra testar não só o sistema, mas também as pessoas e os processos da empresa.',
  },
  {
    id: '02',
    title: 'Teste de Invasão',
    plain: 'Pentest focado',
    desc: 'Avaliação profunda de um alvo específico: site, aplicativo, nuvem ou rede. Exploração feita à mão, não só por scanner automático.',
  },
  {
    id: '03',
    title: '0day Research',
    plain: 'Caça a falhas desconhecidas',
    desc: 'Pesquisa de vulnerabilidades que ainda ninguém descobriu, com aviso responsável ao fabricante antes de qualquer divulgação.',
  },
  {
    id: '04',
    title: 'Threat Intel',
    plain: 'Vigilância de ameaças',
    desc: 'Monitoramos vazamentos de senhas, dados expostos e conversas em fóruns sobre a sua empresa — antes que virem um problema.',
  },
];

const PROCESS = [
  {
    n: '01',
    title: 'Mapeamento',
    desc: 'Estudamos seu sistema como um invasor estudaria: o que está visível na internet, quais são as portas de entrada.',
  },
  {
    n: '02',
    title: 'Exploração',
    desc: 'Com a sua autorização, tentamos invadir de verdade — para provar o que é realmente perigoso, e não só teórico.',
  },
  {
    n: '03',
    title: 'Relatório',
    desc: 'Você recebe um documento claro: o que achamos, o risco de cada item e o passo a passo para corrigir. Sem juridiquês.',
  },
];

const WORK = [
  {
    code: 'OP-BLACKOUT',
    name: 'Setor financeiro',
    year: '2026',
    note: 'Conseguimos acesso ao ambiente de produção partindo de um único ponto exposto na internet. Tudo corrigido antes de qualquer risco real.',
    metric: '6 falhas',
  },
  {
    code: 'PRJ-QUIMERA',
    name: 'Plataforma SaaS',
    year: '2025',
    note: 'Encontramos uma falha que permitiria um cliente enxergar os dados de outro. Reportada e fechada em 48h.',
    metric: '1.4M contas',
  },
  {
    code: 'CVE-2026-1337',
    name: 'Driver de sistema',
    year: '2025',
    note: 'Vulnerabilidade inédita em um componente de baixo nível. Avisamos o fabricante e ajudamos na correção.',
    metric: 'inédita',
  },
  {
    code: 'OP-SIRENE',
    name: 'Indústria',
    year: '2024',
    note: 'Teste em rede industrial isolada. Mostramos como um invasor sairia do escritório e chegaria ao chão de fábrica.',
    metric: 'rede isolada',
  },
];

const FAQ = [
  {
    q: 'Preciso entender de tecnologia para contratar?',
    a: 'Não. A gente cuida da parte técnica e te entrega tudo em linguagem simples, com prioridades claras do que resolver primeiro.',
  },
  {
    q: 'Vocês podem quebrar meu sistema de verdade?',
    a: 'Trabalhamos sempre em escopo combinado e ambiente controlado. O objetivo é encontrar problemas com segurança, sem causar dano nem parar sua operação.',
  },
  {
    q: 'Isso é legal?',
    a: 'Sim. Tudo é feito com autorização por escrito e um contrato que define exatamente o que pode e o que não pode ser testado.',
  },
  {
    q: 'Quanto tempo leva?',
    a: 'Depende do tamanho do alvo, mas a maioria dos trabalhos fica entre 1 e 3 semanas, do início ao relatório final.',
  },
];

const STACK = ['burp suite', 'ghidra', 'metasploit', 'nmap', 'wireshark', 'frida', 'bloodhound', 'radare2'];

function Boot({ onDone }) {
  const [pct, setPct] = useState(0);

  useEffect(() => {
    let raf;
    const t0 = performance.now();
    const tick = (t) => {
      const p = Math.min(1, (t - t0) / 1200);
      setPct(Math.round(p * 100));
      if (p < 1) raf = requestAnimationFrame(tick);
      else setTimeout(onDone, 250);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [onDone]);

  return (
    <motion.div
      onClick={onDone}
      exit={{ y: '-100%' }}
      transition={{ duration: 0.6, ease: [0.76, 0, 0.24, 1] }}
      className="fixed inset-0 z-[200] bg-[#08080a] flex flex-col items-center justify-center"
    >
      <div className="font-display text-3xl font-bold tracking-tight mb-6">
        <span className="text-[#ff2d4f]">0day</span>.sh<span className="caret ml-1" />
      </div>
      <div className="w-56 h-px bg-white/10 relative overflow-hidden">
        <div className="absolute inset-y-0 left-0 bg-[#ff2d4f]" style={{ width: `${pct}%` }} />
      </div>
      <div className="mt-3 text-xs dim-text tabular-nums">carregando ambiente · {pct}%</div>
      <div className="absolute bottom-6 text-[10px] annot">clique para pular</div>
    </motion.div>
  );
}

function Rail() {
  const t = useClock();
  const hh = String(t.getHours()).padStart(2, '0');
  const mm = String(t.getMinutes()).padStart(2, '0');
  const ss = String(t.getSeconds()).padStart(2, '0');
  return (
    <div className="hidden lg:flex fixed left-0 top-0 h-full w-12 z-40 flex-col items-center justify-between py-5 border-r border-white/10 bg-[#08080a]/60 backdrop-blur-sm">
      <span className="w-1.5 h-1.5 rounded-full bg-[#3ddc84] animate-pulse" />
      <div className="[writing-mode:vertical-rl] rotate-180 text-[10px] tracking-[0.3em] uppercase text-white/40">
        0day.sh — offensive security
      </div>
      <div className="[writing-mode:vertical-rl] text-[11px] tabular-nums text-white/35">
        {hh}:{mm}:{ss}
      </div>
    </div>
  );
}

// Scroll suave (inércia) na página toda + links de âncora.
function useSmoothScroll() {
  useEffect(() => {
    // respeita quem pediu menos animação no sistema
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    let raf;
    const loop = (time) => {
      lenis.raf(time);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    // faz os links #ancora rolarem suave também
    const onClick = (e) => {
      const a = e.target.closest('a[href^="#"]');
      if (!a) return;
      const id = a.getAttribute('href');
      if (id === '#' || id.length < 2) return;
      const el = document.querySelector(id);
      if (!el) return;
      e.preventDefault();
      lenis.scrollTo(el, { offset: -64 }); // desconta a altura do header fixo
    };
    document.addEventListener('click', onClick);

    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener('click', onClick);
      lenis.destroy();
    };
  }, []);
}

export default function App() {
  const [booting, setBooting] = useState(() => !sessionStorage.getItem('booted'));
  const { scrollYProgress } = useScroll();
  const barScale = useSpring(scrollYProgress, { stiffness: 120, damping: 30 });

  useSmoothScroll();

  const done = () => {
    sessionStorage.setItem('booted', '1');
    setBooting(false);
  };

  return (
    <div className="relative min-h-screen scanlines noise lg:pl-12">
      <AnimatePresence>{booting && <Boot key="boot" onDone={done} />}</AnimatePresence>
      <Cursor />
      <Rail />

      <motion.div
        style={{ scaleX: barScale }}
        className="fixed top-0 left-0 right-0 h-[2px] bg-[#ff2d4f] origin-left z-[101]"
      />

      <Nav />
      <Hero />
      <Plainspeak />
      <Services />
      <Process />
      <Stats />
      <Work />
      <Faq />
      <Manifesto />
      <Contact />
      <Footer />
    </div>
  );
}

function Nav() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return (
    <header
      className={`fixed top-0 inset-x-0 lg:left-12 z-50 transition-all duration-300 ${
        scrolled ? 'bg-[#08080a]/80 backdrop-blur-md border-b border-white/10' : ''
      }`}
    >
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <a href="#top" className="font-display text-lg font-bold tracking-tight">
          <span className="text-[#ff2d4f]">0day</span>.sh
        </a>
        <nav className="hidden md:flex items-center gap-8 text-sm text-white/55">
          <a href="#services" className="ul-draw hover:text-white transition-colors">Serviços</a>
          <a href="#process" className="ul-draw hover:text-white transition-colors">Como funciona</a>
          <a href="#work" className="ul-draw hover:text-white transition-colors">Casos</a>
          <a href="#faq" className="ul-draw hover:text-white transition-colors">Dúvidas</a>
        </nav>
        <a
          href="#contact"
          className="text-sm border border-white/15 hover:border-[#ff2d4f] hover:text-white text-white/80 px-4 py-2 transition-colors"
        >
          Solicitar auditoria
        </a>
      </div>
    </header>
  );
}

function Hero() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const gridY = useTransform(scrollYProgress, [0, 1], [0, 160]);
  const panelY = useTransform(scrollYProgress, [0, 1], [0, -70]);
  const headY = useTransform(scrollYProgress, [0, 1], [0, 90]);
  const wordY = useTransform(scrollYProgress, [0, 1], [0, -200]);

  return (
    <section id="top" ref={ref} className="relative min-h-screen flex flex-col justify-center overflow-hidden pt-24 pb-16">
      <motion.div
        style={{ y: gridY }}
        className="grid-floor absolute inset-0 [mask-image:radial-gradient(ellipse_at_30%_40%,black,transparent_70%)] opacity-50"
      />
      <div className="absolute -top-32 left-1/4 w-[500px] h-[500px] rounded-full bg-[#ff2d4f]/12 blur-[150px] pointer-events-none" />
      <div className="absolute bottom-0 -right-20 w-[420px] h-[420px] rounded-full bg-[#9d5cff]/10 blur-[150px] pointer-events-none" />

      <motion.div
        style={{ y: wordY }}
        className="absolute -bottom-10 -left-6 font-display font-bold text-[26vw] leading-none text-white/[0.022] select-none pointer-events-none"
      >
        0day
      </motion.div>

      <div className="relative max-w-6xl mx-auto px-6 w-full grid lg:grid-cols-[1.15fr_0.85fr] gap-10 lg:gap-16 items-end">
        <motion.div style={{ y: headY }}>
          <div className="flex items-center gap-3 mb-8 annot">
            <span className="w-6 h-px bg-[#ff2d4f]" />
            pesquisa ofensiva de segurança
          </div>

          <motion.h1
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.1, delayChildren: 0.1 } } }}
            className="font-display font-bold leading-[0.92] tracking-tighter text-[15vw] sm:text-7xl lg:text-8xl"
          >
            {['Encontramos as falhas', 'antes dos'].map((w, i) => (
              <motion.span
                key={i}
                variants={{ hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } }}
                className="block"
              >
                {w}
              </motion.span>
            ))}
            <motion.span
              variants={{ hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } }}
              className="block text-[#ff2d4f] text-glow"
            >
              invasores.
            </motion.span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.7 }}
            className="mt-8 text-base md:text-lg text-white/60 max-w-lg leading-relaxed"
          >
            Simulamos ataques reais ao seu sistema para encontrar as brechas e mostrar
            como fechá-las antes que alguém com más intenções as use.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.85, duration: 0.6 }}
            className="mt-10 flex flex-wrap items-center gap-5"
          >
            <a
              href="#contact"
              className="group bg-[#ff2d4f] text-black font-medium px-7 py-3.5 hover:bg-white transition-colors"
            >
              Solicitar uma auditoria
            </a>
            <a href="#process" className="text-white/70 hover:text-white ul-draw transition-colors">
              entender como funciona →
            </a>
          </motion.div>
        </motion.div>

        <motion.div style={{ y: panelY }} className="relative hidden lg:block">
          <Corners />
          <div className="border border-white/12 bg-[#0b0b0e]/90 backdrop-blur-sm">
            <div className="flex items-center justify-between px-4 h-9 border-b border-white/10 text-[11px] text-white/40">
              <span>recon.log</span>
              <span className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#3ddc84] animate-pulse" /> ao vivo
              </span>
            </div>
            <div className="p-5 text-[13px] leading-relaxed min-h-[260px]">
              <Typewriter lines={BOOT} />
            </div>
            <div className="border-t border-white/10 px-4 py-2 flex justify-between annot">
              <span>fig.01 — simulação</span>
              <span>lat —23.5 / lng —46.6</span>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="relative max-w-6xl mx-auto px-6 w-full mt-16">
        <div className="flex items-center gap-6 text-xs text-white/30 overflow-hidden">
          <span className="annot shrink-0 text-[#ff2d4f]">arsenal //</span>
          <div className="flex gap-6 flex-wrap">
            {STACK.map((s) => (
              <span key={s}>{s}</span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Plainspeak() {
  return (
    <section className="border-y border-white/10 bg-[#0a0a0c]">
      <div className="max-w-6xl mx-auto px-6 py-12 grid md:grid-cols-[auto_1fr] gap-6 md:gap-12 items-center">
        <div className="annot text-[#ff2d4f] shrink-0">// em português claro</div>
        <p className="font-display text-xl md:text-2xl leading-relaxed text-white/85">
          Toda empresa hoje depende de sistemas — e todo sistema tem brechas. Nosso
          trabalho é achá-las <span className="text-[#ff2d4f]">primeiro</span>, do jeito
          que um invasor faria, mas do seu lado. Você dorme tranquilo; a gente fica
          paranoico por você.
        </p>
      </div>
    </section>
  );
}

function Services() {
  return (
    <section id="services" className="max-w-6xl mx-auto px-6 py-28">
      <SectionHead n="01" label="serviços" plain="O que a gente faz." />
      <div className="grid md:grid-cols-2 gap-px bg-white/10 border border-white/10">
        {SERVICES.map((s, i) => (
          <motion.div
            key={s.id}
            onMouseMove={onSpot}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.5, delay: (i % 2) * 0.08 }}
            className="spotlight group bg-[#08080a] p-8 md:p-10 hover:bg-[#0c0c0f] transition-colors"
          >
            <div className="flex items-baseline justify-between">
              <span className="text-xs text-[#ff2d4f] tracking-widest">{s.id}</span>
              <span className="annot">{s.plain}</span>
            </div>
            <h3 className="font-display text-2xl md:text-3xl font-semibold mt-5 mb-3 group-hover:text-[#ff2d4f] transition-colors">
              {s.title}
            </h3>
            <p className="text-sm text-white/55 leading-relaxed max-w-md">{s.desc}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function Process() {
  return (
    <section id="process" className="max-w-6xl mx-auto px-6 py-28">
      <SectionHead n="02" label="como funciona" plain="Simples, em três passos." />
      <div className="grid md:grid-cols-3 gap-10 md:gap-8">
        {PROCESS.map((p, i) => (
          <motion.div
            key={p.n}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            className="relative pt-8 border-t border-white/15"
          >
            <span className="absolute -top-[2px] left-0 w-12 h-[2px] bg-[#ff2d4f]" />
            <div className="font-display text-5xl font-bold text-white/15 mb-4">{p.n}</div>
            <h3 className="font-display text-xl font-semibold mb-3">{p.title}</h3>
            <p className="text-sm text-white/55 leading-relaxed">{p.desc}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function Stats() {
  return (
    <section className="border-y border-white/10 bg-[#0a0a0c]">
      <div className="h-2 ruler [mask-image:linear-gradient(to_right,transparent,black,transparent)]" />
      <div className="max-w-6xl mx-auto px-6 py-16 grid grid-cols-2 lg:grid-cols-4 gap-10">
        <Stat value={1204} format={(n) => `${Math.round(n).toLocaleString('pt-BR')}+`} label="brechas reportadas e corrigidas" />
        <Stat value={47} format={(n) => Math.round(n)} label="CVE's publicadas" />
        <Stat value={100} format={(n) => `${Math.round(n)}%`} label="dos testes com escopo autorizado" />
        <Stat value={24} format={(n) => `${Math.round(n)}h`} label="para o primeiro retorno" />
      </div>
    </section>
  );
}

function Work() {
  const [open, setOpen] = useState(0);
  return (
    <section id="work" className="max-w-6xl mx-auto px-6 py-28">
      <SectionHead n="03" label="casos" plain="Alguns trabalhos (anonimizados)." />
      <div className="border-t border-white/10">
        {WORK.map((w, i) => (
          <div
            key={w.code}
            data-hover
            onMouseEnter={() => setOpen(i)}
            className="group border-b border-white/10 py-7 grid grid-cols-[auto_1fr_auto] gap-4 md:gap-8 items-center cursor-pointer"
          >
            <span className="text-xs dim-text w-8">/{String(i + 1).padStart(2, '0')}</span>
            <div>
              <div className="flex items-baseline gap-3 flex-wrap">
                <span className="font-display text-xl md:text-2xl font-semibold text-white/80 group-hover:text-[#ff2d4f] transition-colors">
                  {w.code}
                </span>
                <span className="text-sm text-white/45">{w.name}</span>
              </div>
              <AnimatePresence initial={false}>
                {open === i && (
                  <motion.p
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="text-sm text-white/55 max-w-xl overflow-hidden"
                  >
                    <span className="block pt-3">{w.note}</span>
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
            <div className="text-right">
              <div className="text-sm text-[#ff2d4f]">{w.metric}</div>
              <div className="text-xs dim-text">{w.year}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function Faq() {
  const [open, setOpen] = useState(0);
  return (
    <section id="faq" className="max-w-3xl mx-auto px-6 py-28">
      <SectionHead n="04" label="dúvidas" plain="Perguntas frequentes." />
      <div className="border-t border-white/10">
        {FAQ.map((f, i) => {
          const isOpen = open === i;
          return (
            <div key={i} className="border-b border-white/10">
              <button
                onClick={() => setOpen(isOpen ? -1 : i)}
                className="w-full py-6 flex items-center justify-between gap-6 text-left"
              >
                <span className="font-display text-lg md:text-xl font-medium">{f.q}</span>
                <span className={`text-[#ff2d4f] text-2xl leading-none transition-transform duration-300 ${isOpen ? 'rotate-45' : ''}`}>
                  +
                </span>
              </button>
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <p className="pb-6 text-sm text-white/55 leading-relaxed max-w-xl">{f.a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function Manifesto() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const x1 = useTransform(scrollYProgress, [0, 1], ['-6%', '6%']);
  const x2 = useTransform(scrollYProgress, [0, 1], ['6%', '-6%']);
  return (
    <section ref={ref} className="py-32 overflow-hidden border-y border-white/10 bg-[#0a0a0c]">
      <motion.div style={{ x: x1 }} className="font-display text-6xl md:text-8xl font-bold text-white/[0.035] whitespace-nowrap select-none">
        SEGURANÇA NÃO É PRODUTO · SEGURANÇA NÃO É PRODUTO ·
      </motion.div>
      <div className="max-w-4xl mx-auto px-6 py-14 text-center">
        <p className="font-display text-2xl md:text-4xl font-medium leading-snug">
          Segurança não é algo que se compra uma vez.{' '}
          <span className="text-white/40">
            É um cuidado constante contra quem nunca para de tentar.
          </span>
        </p>
      </div>
      <motion.div style={{ x: x2 }} className="font-display text-6xl md:text-8xl font-bold text-white/[0.035] whitespace-nowrap text-right select-none">
        · É UM PROCESSO CONTÍNUO · É UM PROCESSO CONTÍNUO ·
      </motion.div>
    </section>
  );
}

function Contact() {
  const [sent, setSent] = useState(false);
  return (
    <section id="contact" className="max-w-3xl mx-auto px-6 py-28">
      <SectionHead n="05" label="contato" plain="Vamos conversar." />
      <div className="relative">
        <Corners />
        <div className="border border-white/12 bg-[#0b0b0e]">
          <div className="flex items-center justify-between px-4 h-9 border-b border-white/10 text-[11px] text-white/40">
            <span>novo-contato.txt</span>
            <span className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#3ddc84]" /> canal seguro
            </span>
          </div>
          <div className="p-8 md:p-10">
            <AnimatePresence mode="wait">
              {sent ? (
                <motion.div key="ok" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-10 text-center">
                  <div className="text-[#3ddc84] text-lg mb-2">[ ok ] mensagem enviada com segurança.</div>
                  <p className="text-sm text-white/50">Retornamos em até 24 horas. Obrigado!</p>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  onSubmit={(e) => {
                    e.preventDefault();
                    setSent(true);
                  }}
                  className="space-y-6"
                >
                  <p className="text-sm text-white/50">
                    Conte rapidamente o que você precisa — sem termos técnicos, do seu jeito.
                  </p>
                  <Field label="seu nome" name="name" placeholder="Como podemos te chamar?" />
                  <Field label="email" name="email" type="email" placeholder="voce@empresa.com" />
                  <div className="space-y-2">
                    <label className="annot block">o que você quer proteger?</label>
                    <textarea
                      required
                      rows="4"
                      placeholder="Ex: tenho um site/app e quero saber se está seguro..."
                      className="w-full bg-black/40 border border-white/10 focus:border-[#ff2d4f] px-4 py-3 text-sm text-white outline-none transition-colors resize-none"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-[#ff2d4f] text-black font-medium py-3.5 hover:bg-white transition-colors"
                  >
                    Enviar mensagem
                  </button>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}

function Field({ label, name, type = 'text', placeholder }) {
  return (
    <div className="space-y-2">
      <label className="annot block">{label}</label>
      <input
        required
        type={type}
        name={name}
        placeholder={placeholder}
        className="w-full bg-black/40 border border-white/10 focus:border-[#ff2d4f] px-4 py-3 text-sm text-white outline-none transition-colors"
      />
    </div>
  );
}

function Footer() {
  return (
    <footer className="border-t border-white/10">
      <div className="max-w-6xl mx-auto px-6 py-12 flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
        <div>
          <div className="font-display text-lg font-bold">
            <span className="text-[#ff2d4f]">0day</span>.sh
          </div>
          <p className="text-xs dim-text mt-1">pesquisa ofensiva de segurança · trabalho autorizado</p>
        </div>
        <div className="flex gap-6 text-sm text-white/45">
          <a href="#" className="ul-draw hover:text-white transition-colors">github</a>
          <a href="#" className="ul-draw hover:text-white transition-colors">linkedin</a>
          <a href="#" className="ul-draw hover:text-white transition-colors">chave pgp</a>
        </div>
        <div className="flex items-center gap-2 text-xs dim-text">
          <span className="w-1.5 h-1.5 rounded-full bg-[#3ddc84] animate-pulse" />
          tudo operacional · {new Date().getFullYear()}
        </div>
      </div>
    </footer>
  );
}
