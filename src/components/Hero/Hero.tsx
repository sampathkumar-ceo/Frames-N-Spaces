"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { getSiteData, type HeroData } from "@/data/siteData";
import styles from "./Hero.module.css";
import { fixImageUrl } from "@/utils/imageUtils";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function Hero() {
  const heroRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);
  const actionsRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [hero, setHero] = useState<HeroData | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    getSiteData().then((siteData) => {
      const data = siteData.hero;
      // Sanitize for stale localStorage
      if (data.subtitle.toLowerCase().includes("premium")) {
        data.subtitle = data.subtitle.replace(/premium/gi, "project management");
      }
      setHero(data);
    });
  }, []);

  useEffect(() => {
    if (!hero) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ delay: 0.3 });

      if (labelRef.current) {
        tl.fromTo(labelRef.current, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" });
      }

      if (titleRef.current) {
        const words = titleRef.current.querySelectorAll(`.${styles.titleWord}`);
        tl.fromTo(words, { opacity: 0, y: "110%", rotateX: -30 }, { opacity: 1, y: "0%", rotateX: 0, duration: 1.1, stagger: 0.1, ease: "power3.out" }, "-=0.4");
      }

      if (subtitleRef.current) {
        tl.fromTo(subtitleRef.current, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }, "-=0.5");
      }

      if (actionsRef.current) {
        tl.fromTo(actionsRef.current, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }, "-=0.4");
      }

      if (scrollRef.current) {
        tl.fromTo(scrollRef.current, { opacity: 0 }, { opacity: 1, duration: 0.6 }, "-=0.2");
      }

      // Parallax on scroll
      if (heroRef.current) {
        const content = heroRef.current.querySelector(`.${styles.content}`);
        if (content) {
          gsap.to(content, {
            y: -80,
            opacity: 0.3,
            ease: "none",
            scrollTrigger: { trigger: heroRef.current, start: "top top", end: "bottom top", scrub: 1.2 },
          });
        }
      }
    });

    return () => ctx.revert();
  }, [hero]);

  useEffect(() => {
    const handleScroll = () => {
      if (scrollRef.current) {
        scrollRef.current.style.opacity = String(Math.max(0, 1 - window.scrollY / 400));
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleExplore = (e: React.MouseEvent) => {
    e.preventDefault();
    document.getElementById("about")?.scrollIntoView({ behavior: "smooth" });
  };

  const handleContact = (e: React.MouseEvent) => {
    e.preventDefault();
    document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
  };

  if (!mounted || !hero) return <section className={styles.hero} />;

  return (
    <section id="hero" className={styles.hero} ref={heroRef}>
      {/* Background image */}
      <div
        className={styles.bgImage}
        style={{ backgroundImage: `url(${fixImageUrl(hero.imageUrl)})` }}
      />
      <div className={styles.bgOverlay} />

      <div className={styles.content}>
        <div className={styles.labelWrap} ref={labelRef}>
          <div className={styles.labelLine} />
          <span className={styles.label}>Precision in Every Corner</span>
          <div className={styles.labelLine} />
        </div>

        <h1 className={styles.title} ref={titleRef}>
          <span className={styles.titleLine}>
            <span className={styles.titleWord}>{hero.heading1}</span>
          </span>
          <span className={styles.titleLine}>
            <span className={styles.titleWord}>{hero.heading2}</span>{" "}
            <span className={`${styles.titleWord} ${styles.titleAccent}`}>
              {hero.headingAccent}
            </span>
          </span>
        </h1>

        <p className={styles.subtitle} ref={subtitleRef}>
          {hero.subtitle}
        </p>

        <div className={styles.actions} ref={actionsRef}>
          <button className="btn-primary" onClick={handleExplore}>
            <span>Explore Our Work</span>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button className="btn-outline" onClick={handleContact}>
            <span>Get in Touch</span>
          </button>
        </div>
      </div>

      {/* Scroll indicator */}
      <div ref={scrollRef} className={styles.scrollIndicator}>
        <span className={styles.scrollText}>Scroll</span>
        <div className={styles.scrollLine}>
          <div className={styles.scrollDot} />
        </div>
      </div>
    </section>
  );
}
