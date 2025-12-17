import React, { useEffect, useRef, useState } from "react";

function Reveal({ children, delay = 0 }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setVisible(true);
        observer.disconnect();
      }
    }, { threshold: 0.2 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} style={{ transitionDelay: `${delay}ms` }} className={`transition-all duration-700 ease-out ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
      {children}
    </div>
  );
}

function FloatingCat({ visible }) {
  const positions = [
    { top: "10%", left: "5%" },
    { top: "25%", right: "8%" },
    { bottom: "20%", left: "10%" },
    { bottom: "15%", right: "12%" }
  ];
  const [pos, setPos] = useState(positions[0]);

  useEffect(() => {
    if (visible) setPos(positions[Math.floor(Math.random() * positions.length)]);
  }, [visible]);

  return (
    <div style={pos} className={`fixed z-40 pointer-events-none transition-opacity ${visible ? "opacity-100" : "opacity-0"}`}>
      <svg width="48" height="48" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className={visible ? "stroke-white cat-jump" : "stroke-white"}>
        <circle cx="60" cy="64" r="28" strokeWidth="4" />
        <path d="M32 48 L20 28" strokeWidth="4" strokeLinecap="round" />
        <path d="M88 48 L100 28" strokeWidth="4" strokeLinecap="round" />
        <circle cx="50" cy="62" r="3" fill="white" />
        <circle cx="70" cy="62" r="3" fill="white" />
      </svg>
    </div>
  );
}

export default function PortfolioBackground() {
  const [showIntro, setShowIntro] = useState(true);
  const [copied, setCopied] = useState("");
  const [showCat, setShowCat] = useState(false);
  const [musicOn, setMusicOn] = useState(() => localStorage.getItem("musicOn") === "true");

  const introSound = useRef(null);
  const catSound = useRef(null);
  const clickSound = useRef(null);
  const bgm = useRef(null);
  const lastInteraction = useRef(0);
  const fadeInterval = useRef(null);

  useEffect(() => {
    introSound.current = new Audio("/sounds/intro.mp3");
    catSound.current = new Audio("/sounds/cat.mp3");
    clickSound.current = new Audio("/sounds/click.mp3");
    bgm.current = new Audio("/sounds/call-of-silence.mp3");

    introSound.current.volume = 0.4;
    catSound.current.volume = 0.5;
    clickSound.current.volume = 0.3;
    bgm.current.volume = 0;
    bgm.current.loop = true;

    if (musicOn) {
      bgm.current.play();
      fadeIn();
    }
  }, []);

  useEffect(() => {
    document.body.style.overflow = showIntro ? "hidden" : "auto";
    if (!showIntro) return;
    introSound.current && introSound.current.play();
    const timer = setTimeout(() => setShowIntro(false), 3000);
    return () => {
      clearTimeout(timer);
      document.body.style.overflow = "auto";
    };
  }, [showIntro]);

  useEffect(() => {
    const trigger = () => {
      const now = Date.now();
      if (now - lastInteraction.current < 30000) return;
      lastInteraction.current = now;
      duck();
      setShowCat(true);
      catSound.current && catSound.current.play();
      setTimeout(() => setShowCat(false), 1200);
      setTimeout(unduck, 1200);
    };
    window.addEventListener("scroll", trigger, { passive: true });
    window.addEventListener("mousemove", trigger);
    window.addEventListener("click", trigger);
    return () => {
      window.removeEventListener("scroll", trigger);
      window.removeEventListener("mousemove", trigger);
      window.removeEventListener("click", trigger);
    };
  }, []);

  const fadeIn = () => {
    clearInterval(fadeInterval.current);
    fadeInterval.current = setInterval(() => {
      if (bgm.current.volume >= 0.25) {
        bgm.current.volume = 0.25;
        clearInterval(fadeInterval.current);
      } else {
        bgm.current.volume += 0.02;
      }
    }, 80);
  };

  const fadeOut = () => {
    clearInterval(fadeInterval.current);
    fadeInterval.current = setInterval(() => {
      if (bgm.current.volume <= 0.02) {
        bgm.current.volume = 0;
        bgm.current.pause();
        clearInterval(fadeInterval.current);
      } else {
        bgm.current.volume -= 0.02;
      }
    }, 80);
  };

  const duck = () => {
    if (!musicOn) return;
    bgm.current.volume = 0.08;
  };

  const unduck = () => {
    if (!musicOn) return;
    bgm.current.volume = 0.25;
  };

  const toggleMusic = () => {
    if (!bgm.current) return;
    if (musicOn) {
      fadeOut();
      setMusicOn(false);
      localStorage.setItem("musicOn", "false");
    } else {
      bgm.current.play();
      fadeIn();
      setMusicOn(true);
      localStorage.setItem("musicOn", "true");
    }
  };

  const copy = async (text) => {
    duck();
    clickSound.current && clickSound.current.play();
    try {
      await navigator.clipboard.writeText(text);
      setCopied(text);
      setTimeout(() => setCopied(""), 1500);
    } catch {}
    setTimeout(unduck, 600);
  };

  return (
    <div className="relative min-h-screen flex flex-col bg-gradient-to-b from-[#0B1C2D] to-[#050505]">
      <style>{`
        .cat-jump{animation:catJump 1.2s ease-out forwards}
        @keyframes catJump{0%{transform:translateY(16px) scale(.8);opacity:0}30%{transform:translateY(-6px) scale(1);opacity:1}60%{transform:translateY(0) scale(1)}100%{opacity:0}}
        .bird-logo path{stroke-dasharray:1000;stroke-dashoffset:1000;animation:draw 3s ease-out forwards}
        .bird-logo path:nth-child(2){animation-delay:.2s}
        .bird-logo path:nth-child(3){animation-delay:.4s}
        .bird-logo path:nth-child(4){animation-delay:.6s}
        @keyframes draw{to{stroke-dashoffset:0}}
        .toast{animation:toast 1.5s ease forwards}
        @keyframes toast{0%{opacity:0;transform:translateY(6px)}15%{opacity:1;transform:translateY(0)}85%{opacity:1}100%{opacity:0}}
      `}</style>

      {showIntro && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-b from-[#0B1C2D] to-[#050505]">
          <svg width="72" height="72" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="stroke-white bird-logo">
            <path d="M70 30 C85 28, 95 32, 105 36" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M70 30 C55 45, 55 70, 50 95" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M70 40 C50 35, 35 25, 30 15" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M65 48 C48 46, 38 40, 32 32" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <div className="mt-4 text-white text-2xl font-semibold tracking-widest">atly.uk</div>
        </div>
      )}

      <header className="relative z-10 w-full px-6 py-4 flex items-center justify-between border-b border-white/10">
        <div className="flex items-center gap-4">
          <button onClick={toggleMusic} className="w-9 h-9 flex items-center justify-center text-white/70 hover:text-white transition" aria-label="Toggle background music">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
              {musicOn && (<><path d="M15 9c1.2 1.5 1.2 4.5 0 6" /><path d="M18 7c2 2.5 2 7.5 0 10" /></>)}
            </svg>
          </button>
          <div className="flex items-center gap-3">
            <svg width="36" height="36" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="stroke-white bird-logo">
              <path d="M70 30 C85 28, 95 32, 105 36" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M70 30 C55 45, 55 70, 50 95" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M70 40 C50 35, 35 25, 30 15" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M65 48 C48 46, 38 40, 32 32" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="text-white text-xl font-semibold tracking-wide">atly.uk</span>
          </div>
        </div>
        <nav className="space-x-6 text-white/80">
          <a href="#about" className="hover:text-white transition">About</a>
          <a href="#blog" className="hover:text-white transition">Blog</a>
          <a href="#work" className="hover:text-white transition">Work</a>
          <a href="#contact" className="hover:text-white transition">Contact</a>
        </nav>
      </header>

      <main className="flex-grow">
        <section id="about" className="w-full px-6 py-32">
          <div className="max-w-6xl mx-auto flex flex-col gap-28">
            <Reveal>
              <div className="grid grid-cols-2 gap-16 items-center">
                <div className="flex justify-center">
                  <div className="relative w-72 h-96 rounded-2xl overflow-hidden border border-white/10 bg-black/40 flex flex-col items-center justify-center transition-transform duration-500 ease-out hover:scale-105 hover:-rotate-1">
                    <svg width="96" height="96" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="stroke-white bird-logo">
                      <path d="M70 30 C85 28, 95 32, 105 36" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M70 30 C55 45, 55 70, 50 95" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M70 40 C50 35, 35 25, 30 15" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M65 48 C48 46, 38 40, 32 32" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <div className="mt-6 text-white font-semibold tracking-widest text-lg">atly.uk</div>
                  </div>
                </div>
                <div className="flex flex-col justify-center gap-8">
                  <h1 className="text-3xl md:text-4xl font-semibold text-white">About Me</h1>
                  <p className="text-white/70 leading-relaxed">I am Abraham Ting, focused on building calm, intentional digital experiences that balance clarity, logic, and human-centered design.</p>
                  <p className="text-white/70 leading-relaxed">My work spans design, systems thinking, and thoughtful communication, shaped by years of learning, teaching, and building.</p>
                  <div className="flex gap-4 mt-4">
                    <a href="#work" className="px-6 py-3 rounded-lg border border-white/20 text-white hover:bg-white/5 transition">View Work</a>
                    <a href="#contact" className="px-6 py-3 rounded-lg border border-white/20 text-white hover:bg-white/5 transition">Contact Me</a>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </section>
      </main>

      <footer className="w-full px-6 py-14 border-t border-white/10 text-white/60">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <svg width="28" height="28" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="stroke-white bird-logo">
                <path d="M70 30 C85 28, 95 32, 105 36" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M70 30 C55 45, 55 70, 50 95" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M70 40 C50 35, 35 25, 30 15" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M65 48 C48 46, 38 40, 32 32" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="text-white font-semibold tracking-wide">atly.uk</span>
            </div>
            <p className="text-sm leading-relaxed">Designing calm, meaningful digital experiences.</p>
          </div>
          <div className="flex flex-col gap-3 text-sm">
            <span className="text-white/80 font-medium">Explore</span>
            <a href="#about" className="hover:text-white transition">About</a>
            <a href="#blog" className="hover:text-white transition">Blog</a>
            <a href="#work" className="hover:text-white transition">Work</a>
            <a href="#contact" className="hover:text-white transition">Contact</a>
          </div>
          <div className="flex flex-col items-start gap-3">
            <span className="text-white/80 font-medium text-sm">Contact</span>
            <div className="flex items-center gap-5">
              <a href="https://instagram.com/atly1203" target="_blank" rel="noopener noreferrer" className="hover:opacity-100 opacity-70 transition">IG</a>
              <button onClick={() => copy("01156395221")} className="hover:opacity-100 opacity-70 transition">WA</button>
              <button onClick={() => copy("abr.ting@gmail.com")} className="hover:opacity-100 opacity-70 transition">Mail</button>
            </div>
          </div>
        </div>
        <div className="mt-12 pt-6 border-t border-white/10 text-center text-sm">2025 Abraham Ting | All rights are reserved</div>
      </footer>

      <FloatingCat visible={showCat} />

      {copied && <div className="fixed bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 bg-black/80 text-white text-sm rounded-lg toast">Copied</div>}
    </div>
  );
}