import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import quantumSecure from "../assets/quantum_secure.jpg";
import screenshotProtection from "../assets/screenshot_protection.jpg";
import mediaSharing from "../assets/media_sharing.jpg";
import notificationImg from "../assets/notification.jpg";
import friendSystem from "../assets/friend_system.jpg";
import chatRestore from "../assets/chat_restore.jpeg";
import chatBackup from "../assets/chat_backup.jpeg";

function FeaturesSlider() {
  const sliderRef = useRef(null);
  const sliderViewportRef = useRef(null);
  const sectionAnimationTimeoutRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);
  const [transitionEnabled, setTransitionEnabled] = useState(true);
  const [cardWidth, setCardWidth] = useState(0);
  const [isSectionVisible, setIsSectionVisible] = useState(false);
  const isAnimatingRef = useRef(false);
  const VISIBLE_CARDS = 3;
  const GAP_PX = 32;
  const TRANSITION_MS = 550;

  const features = [
    {
      id: 1,
      title: "Quantum Secure Chat",
      subtitle: "Powered by BB84 encryption",
      icon: "🔐",
      color: "from-cyan-600 to-blue-600",
      bgImage: quantumSecure,
    },
    {
      id: 2,
      title: "Screenshot Protection",
      subtitle: "Your privacy is always protected",
      icon: "📸",
      color: "from-emerald-600 to-teal-600",
      bgImage: screenshotProtection,
    },
    {
      id: 3,
      title: "Smart Chat Restore",
      subtitle: "Restore conversations anytime",
      icon: "♻️",
      color: "from-purple-600 to-pink-600",
      bgImage: chatRestore,
    },
    {
      id: 4,
      title: "Media Sharing",
      subtitle: "Send files securely",
      icon: "📁",
      color: "from-orange-600 to-red-600",
      bgImage: mediaSharing,
    },
    {
      id: 5,
      title: "Real-Time Notifications",
      subtitle: "Instant message alerts & updates",
      icon: "🔔",
      color: "from-indigo-600 to-purple-600",
      bgImage: notificationImg,
    },
    {
      id: 6,
      title: "Friend System",
      subtitle: "Manage connections effortlessly",
      icon: "👥",
      color: "from-rose-600 to-pink-600",
      bgImage: friendSystem,
    },
    {
      id: 7,
      title: "Chat Backup",
      subtitle: "Never lose your conversations",
      icon: "☁️",
      color: "from-blue-600 to-cyan-600",
      bgImage: chatBackup,
    },
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            sectionAnimationTimeoutRef.current = setTimeout(() => {
              setIsSectionVisible(true);
            }, 500);
          } else {
            setIsSectionVisible(false);
            if (sectionAnimationTimeoutRef.current) {
              clearTimeout(sectionAnimationTimeoutRef.current);
            }
          }
        });
      },
      { threshold: 0.2 }
    );

    if (sliderRef.current) {
      observer.observe(sliderRef.current);
    }

    return () => {
      observer.disconnect();
      if (sectionAnimationTimeoutRef.current) {
        clearTimeout(sectionAnimationTimeoutRef.current);
      }
    };
  }, []);

  const loopedFeatures = useMemo(
    () => [...features, ...features.slice(0, VISIBLE_CARDS)],
    [features, VISIBLE_CARDS]
  );

  useEffect(() => {
    if (!sliderViewportRef.current) return;

    const updateCardWidth = () => {
      const viewportWidth = sliderViewportRef.current.clientWidth;
      const totalGapWidth = GAP_PX * (VISIBLE_CARDS - 1);
      setCardWidth((viewportWidth - totalGapWidth) / VISIBLE_CARDS);
    };

    updateCardWidth();

    const resizeObserver = new ResizeObserver(updateCardWidth);
    resizeObserver.observe(sliderViewportRef.current);

    return () => resizeObserver.disconnect();
  }, [GAP_PX, VISIBLE_CARDS]);

  useEffect(() => {
    if (!isAutoPlay) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => prev + 1);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlay]);

  useEffect(() => {
    if (currentIndex !== features.length) return;

    const timeoutId = setTimeout(() => {
      setTransitionEnabled(false);
      setCurrentIndex(0);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setTransitionEnabled(true);
          isAnimatingRef.current = false;
        });
      });
    }, TRANSITION_MS);

    return () => clearTimeout(timeoutId);
  }, [currentIndex, features.length, TRANSITION_MS]);

  const moveSlide = (direction) => {
    if (isAnimatingRef.current) return; // Prevent clicks during animation
    
    isAnimatingRef.current = true;
    setIsAutoPlay(false);
    
    if (direction === "next") {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setTransitionEnabled(false);
      setCurrentIndex((prev) => {
        const normalized = prev % features.length;
        return normalized === 0 ? features.length - 1 : normalized - 1;
      });
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setTransitionEnabled(true);
        });
      });
    }
    
    setTimeout(() => {
      isAnimatingRef.current = false;
      setIsAutoPlay(true);
    }, TRANSITION_MS);
  };

  return (
    <section
      ref={sliderRef}
      className="features-section relative w-full min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex flex-col items-center justify-center px-4 md:px-8 py-20"
    >
      <div className="absolute inset-0 opacity-25">
        <div className="absolute top-32 -left-40 w-96 h-96 bg-cyan-500/25 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 right-0 w-96 h-96 bg-emerald-500/25 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"></div>
      </div>

      <div
        className={`relative z-10 w-full max-w-6xl mx-auto transition-all duration-700 ${
          isSectionVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
        }`}
      >
        {/* Header */}
        <div className="text-center mb-16 animate-fade-in-up">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-emerald-400 to-cyan-500">
              Talk Freely, Communicate Securely
            </span>
          </h2>
          <p className="text-slate-300/70 text-lg max-w-2xl mx-auto">
            Experience advanced features designed for your security and privacy
          </p>
        </div>

        {/* Slider Controls - Arrows on sides */}
        <div className="flex items-center justify-between gap-4">
          <button
            onClick={() => moveSlide("prev")}
            className="flex-shrink-0 p-3 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20 transition-all duration-300 hover:scale-110"
            aria-label="Previous"
          >
            <ChevronLeftIcon className="w-6 h-6" />
          </button>

          <div ref={sliderViewportRef} className="flex-1 overflow-hidden">
            <div
              className="flex gap-8"
              style={{
                transform: `translateX(-${currentIndex * (cardWidth + GAP_PX)}px)`,
                transition: transitionEnabled ? `transform ${TRANSITION_MS}ms ease` : "none",
              }}
            >
              {loopedFeatures.map((feature, index) => (
                <div
                  key={`${feature.id}-${index}`}
                  className={`flex-shrink-0 animate-fade-in-up transition-all duration-300 ${
                    index % features.length === (currentIndex + 1) % features.length
                      ? "scale-100"
                      : "scale-95"
                  }`}
                  style={{
                    width: cardWidth > 0 ? `${cardWidth}px` : "calc((100% - 64px) / 3)",
                    minWidth: cardWidth > 0 ? `${cardWidth}px` : "calc((100% - 64px) / 3)",
                  }}
                >
                  <div
                    className={`relative h-96 rounded-2xl overflow-hidden cursor-pointer group shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105`}
                  >
                    {/* Background Image or Gradient */}
                    {feature.bgImage ? (
                      <>
                        <img
                          src={feature.bgImage}
                          alt={feature.title}
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                        {/* Dark overlay for image cards */}
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/60 to-slate-950/40 group-hover:from-slate-950 group-hover:via-slate-900/50 group-hover:to-slate-950/30 transition-all duration-300"></div>
                      </>
                    ) : (
                      <>
                        {/* Gradient background for cards without images */}
                        <div
                          className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-85`}
                        ></div>
                        {/* Overlay */}
                        <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-all duration-300"></div>
                      </>
                    )}

                    {/* Content */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-6 text-center">
                      <div className="text-6xl mb-4 transform group-hover:scale-110 transition-transform duration-300">
                        {feature.icon}
                      </div>
                      <h3 className="text-2xl md:text-3xl font-bold mb-3 text-white drop-shadow-lg">
                        {feature.title}
                      </h3>
                      <p className="text-white text-base max-w-xs drop-shadow-md leading-relaxed font-medium">
                        {feature.subtitle}
                      </p>
                    </div>

                    {/* Bottom Border Accent */}
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-white/0 via-white/80 to-white/0 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => moveSlide("next")}
            className="flex-shrink-0 p-3 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 transition-all duration-300 hover:scale-110"
            aria-label="Next"
          >
            <ChevronRightIcon className="w-6 h-6" />
          </button>
        </div>
      </div>
    </section>
  );
}

export default FeaturesSlider;
