"use client";

import { supabase } from "@/lib/supabase";
import { useState } from "react";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import styles from "./Contact.module.css";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    message: "",
  });

  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const headerRef = useScrollReveal();
  const formRef = useScrollReveal(0.1);
  const infoRef = useScrollReveal(0.1);

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 🔴 1. Required fields check FIRST
    if (!formData.name || !formData.email || !formData.message) {
      setErrorMsg("Please fill in all required fields.");
      setStatus("error");
      return;
    }

    // 🟡 2. Email validation SECOND
    if (!validateEmail(formData.email)) {
      setErrorMsg("Please enter a valid email address.");
      setStatus("error");
      return;
    }

    // 🟢 3. Only now start submission
    setStatus("submitting");
    setErrorMsg("");

    try {
      const payload = {
        ...formData,
        timestamp: new Date().toISOString(),
        site_version: "1.0.0",
      };

      console.log("Submitting:", payload);

      // ✅ 1. Save to Supabase
      const { error } = await supabase
        .from("contacts")
        .insert([payload]);

      if (error) throw error;

      // ✅ 2. Trigger email API
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Email failed");

      // ✅ Success state
      setStatus("success");
      setFormData({
        name: "",
        email: "",
        company: "",
        message: "",
      });

    } catch (err) {
      console.error("Submission error:", err);
      setErrorMsg("Something went wrong. Please try again.");
      setStatus("error");
    }
  };

  const handleRetry = () => {
    setStatus("idle");
    setErrorMsg("");
  };

  return (
    <section id="contact" className={`section ${styles.contact}`}>
      <div className="container">
        <div className={styles.header} ref={headerRef}>
          <span className="label">[ 10 ] — Get in Touch</span>
          <h2 className={`heading-lg ${styles.heading}`}>
            Let&apos;s <span className={styles.accent}>Connect</span>
          </h2>
          <p className="body-lg" style={{ maxWidth: "550px" }}>
            Ready to transform your workspace? Reach out and let&apos;s discuss
            your vision. Our advisory team is here to help.
          </p>
        </div>

        <div className={styles.grid}>
          {/* FORM */}
          <div ref={formRef}>
            {status === "success" ? (
              <div className={styles.successMessage}>
                <div className={styles.successIcon}>✓</div>
                <h3>Message Sent Successfully!</h3>
                <p>Thank you for reaching out. Our team will get back to you shortly.</p>
                <button
                  className={`btn-primary ${styles.retryBtn}`}
                  onClick={() => setStatus("idle")}
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form className={styles.form} onSubmit={handleSubmit}>
                <div className={styles.formRow}>
                  <div className={styles.field}>
                    <label htmlFor="name" className={styles.fieldLabel}>Your Name</label>
                    <input
                      id="name"
                      type="text"
                      className={styles.fieldInput}
                      value={formData.name}
                      onChange={(e) => {
                        setFormData({ ...formData, name: e.target.value });
                        setErrorMsg("");
                      }}
                      required
                      disabled={status === "submitting"}
                      placeholder="John Doe"
                    />
                    <div className={styles.fieldLine} />
                  </div>

                  <div className={styles.field}>
                    <label htmlFor="email" className={styles.fieldLabel}>Email Address</label>
                    <input
                      id="email"
                      type="email"
                      className={styles.fieldInput}
                      value={formData.email}
                      onChange={(e) => {
                        setFormData({ ...formData, email: e.target.value });
                        setErrorMsg("");
                      }}
                      required
                      disabled={status === "submitting"}
                      placeholder="john@company.com"
                    />
                    <div className={styles.fieldLine} />
                  </div>
                </div>

                <div className={styles.field}>
                  <label htmlFor="company" className={styles.fieldLabel}>Company (Optional)</label>
                  <input
                    id="company"
                    type="text"
                    className={styles.fieldInput}
                    value={formData.company}
                    onChange={(e) =>
                      setFormData({ ...formData, company: e.target.value })
                    }
                    disabled={status === "submitting"}
                    placeholder="Your Company"
                  />
                  <div className={styles.fieldLine} />
                </div>

                <div className={styles.field}>
                  <label htmlFor="message" className={styles.fieldLabel}>Message</label>
                  <textarea
                    id="message"
                    className={`${styles.fieldInput} ${styles.fieldTextarea}`}
                    value={formData.message}
                    onChange={(e) => {
                      setFormData({ ...formData, message: e.target.value });
                      setErrorMsg("");
                    }}
                    required
                    disabled={status === "submitting"}
                    placeholder="Tell us about your project..."
                    rows={4}
                  />
                  <div className={styles.fieldLine} />
                </div>

                {status === "error" && (
                  <div className={styles.errorMessage} role="alert">
                    <span>{errorMsg}</span>
                    <button
                      type="button"
                      onClick={handleRetry}
                      className={styles.inlineRetry}
                    >
                      Retry
                    </button>
                  </div>
                )}

                <button
                  type="submit"
                  className={`btn-primary ${styles.submitBtn} ${status === "submitting" ? styles.btnLoading : ""
                    }`}
                  disabled={status === "submitting"}
                >
                  <span className={styles.btnText}>
                    {status === "submitting" ? "Sending..." : "Send Message"}
                  </span>
                  {status === "submitting" && <div className={styles.loader} />}
                </button>
              </form>
            )}
          </div>

          {/* INFO */}
          <div className={styles.info} ref={infoRef}>
            <div className={styles.infoCard}>
              <div className={styles.infoIcon}>📍</div>
              <div>
                <h4 className={styles.infoTitle}>Office Location</h4>
                <p className={styles.infoText}>
                  109, Lumbini Avenue, Gachibowli,
                  <br />
                  Hyderabad, Telangana, India
                </p>
              </div>
            </div>

            <div className={styles.infoCard}>
              <div className={styles.infoIcon}>✉️</div>
              <div>
                <h4 className={styles.infoTitle}>Email Us</h4>
                <a href="mailto:info@framesnspaces.com" className={styles.infoLink}>
                  info@framesnspaces.com
                </a>
              </div>
            </div>

            <div className={styles.infoCard}>
              <div className={styles.infoIcon}>📞</div>
              <div>
                <h4 className={styles.infoTitle}>Call Us</h4>
                <a href="tel:+918919296590" className={styles.infoLink}>
                  +91-70003 36196
                </a>
              </div>
            </div>

            <div className={styles.infoCard}>
              <div className={styles.infoIcon}>🕐</div>
              <div>
                <h4 className={styles.infoTitle}>Working Hours</h4>
                <p className={styles.infoText}>
                  Monday — Friday
                  <br />
                  9:30 AM — 6:30 PM IST
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}