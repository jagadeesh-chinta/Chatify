import { useEffect, useRef, useState } from "react";

function PrivacySection() {
  const sectionRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Animation starts immediately when section is visible
            setIsVisible(true);
            entry.target.classList.add("animate-fade-in-up");
          } else {
            // Reset animation when leaving the section
            setIsVisible(false);
            entry.target.classList.remove("animate-fade-in-up");
          }
        });
      },
      { threshold: 0.3 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="privacy-section relative w-full min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4 md:px-8 py-20"
    >
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-20 left-10 w-72 h-72 bg-cyan-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-emerald-500/20 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto text-center">
        <div className="animate-fade-in-up">
          <p className="text-cyan-300/60 text-sm md:text-base font-medium tracking-widest uppercase mb-6">
            Our Commitment
          </p>

          <h2 className="text-4xl md:text-6xl font-bold leading-tight mb-8">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-emerald-400 to-cyan-500">
              Privacy is not an option,
            </span>
            <br />
            <span className="text-white">
              it is a necessity in the digital world.
            </span>
          </h2>

          <p className="text-slate-300/80 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed mb-10">
            Your conversations are yours alone. With quantum-resistant encryption and
            advanced privacy features, we ensure your data remains protected at every step.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <div className="px-6 py-3 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-300">
              🔐 End-to-End Encrypted
            </div>
            <div className="px-6 py-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300">
              🛡️ Zero Knowledge Storage
            </div>
            <div className="px-6 py-3 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-300">
              ⚡ Quantum Safe
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default PrivacySection;
