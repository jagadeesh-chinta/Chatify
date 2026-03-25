import { useEffect, useRef, useState } from "react";
import securityImage from "../assets/security.jpg";

function SecurityShowcaseSection() {
  const sectionRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const timeoutIdRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Delay animation by 0.25 seconds
          timeoutIdRef.current = setTimeout(() => {
            setIsVisible(true);
          }, 250);
        } else {
          // Reset animation when leaving the section
          setIsVisible(false);
          if (timeoutIdRef.current) {
            clearTimeout(timeoutIdRef.current);
          }
        }
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      observer.disconnect();
      if (timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current);
      }
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative w-full min-h-[85vh] bg-gradient-to-b from-slate-900 via-slate-950 to-black px-4 py-14 sm:px-8 lg:px-12 lg:py-20"
    >
      <div className="mx-auto grid w-full max-w-7xl grid-cols-1 items-stretch overflow-visible rounded-2xl border border-cyan-300/15 bg-slate-900/30 p-2 shadow-[0_30px_80px_rgba(2,132,199,0.18)] lg:min-h-[82vh] lg:grid-cols-[1.15fr_0.85fr]">
        <div
          className={`group relative min-h-[320px] overflow-hidden rounded-xl lg:rounded-2xl transition-all duration-700 ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          }`}
          style={{
            backgroundImage:
              `linear-gradient(120deg, rgba(2, 6, 23, 0.58), rgba(8, 47, 73, 0.42)), url(${securityImage})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-slate-950/60 via-slate-900/20 to-cyan-700/30" />
          <div className="absolute inset-0 transition duration-700 group-hover:scale-105 group-hover:bg-cyan-600/10" />
        </div>

        <div className="relative flex items-center lg:-ml-20">
          <div
            className={`relative z-10 mt-6 w-full rounded-xl border border-cyan-300/35 bg-slate-950/78 p-7 shadow-[0_34px_80px_rgba(15,23,42,0.45)] backdrop-blur-md sm:p-10 lg:mt-0 transition-all duration-700 hover:-translate-y-1 hover:border-cyan-300/60 hover:shadow-[0_40px_90px_rgba(6,182,212,0.28)] ${
              isVisible ? "translate-x-0 opacity-100" : "translate-x-12 opacity-0"
            }`}
          >
            <p className="mb-3 text-sm font-semibold tracking-[0.18em] uppercase text-cyan-300">
              Security First
            </p>

            <h3 className="text-3xl font-bold leading-tight text-white sm:text-4xl">
              Your Data Deserves Protection Beyond Today&apos;s Threats
            </h3>

            <p className="mt-5 text-base leading-relaxed text-slate-200 sm:text-lg">
              Chatify ensures next-generation communication security using advanced encryption
              methods like BB84 quantum protocols, protecting your conversations from modern and
              future cyber threats.
            </p>

            <button
              type="button"
              className="mt-8 inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-cyan-500 to-sky-600 px-6 py-3 text-sm font-semibold tracking-wide text-white transition duration-300 hover:-translate-y-1 hover:scale-[1.02] hover:from-cyan-400 hover:to-sky-500"
            >
              <span>Explore Security</span>
              <span aria-hidden="true">{">"}</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default SecurityShowcaseSection;
