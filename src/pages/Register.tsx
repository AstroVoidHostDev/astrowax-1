// @ts-nocheck
import React, { useState, useEffect } from "react";
import { LoadingOverlay } from "../components/LoadingOverlay";
import { useSettings } from "../context/SettingsContext";
import { useNavigate, Link } from "react-router-dom";
import gsap from "gsap";
import axios from "axios";
import "./Register.css";

// ============================================
// AstroWax Panel V1.80 — Register (Custom)
// Video Background + Glass Card
// ============================================
export default function Register() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [introDone, setIntroDone] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [capsLock, setCapsLock] = useState(false);

  const { panelName, enableRegistration } = useSettings();
  const navigate = useNavigate();

  // ─── Password strength ───
  const getStrength = () => {
    if (!password) return { level: 0, label: "", color: "" };
    let score = 0;
    if (password.length >= 6) score++;
    if (password.length >= 10) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 1) return { level: 1, label: "Weak", color: "#ef4444" };
    if (score === 2) return { level: 2, label: "Fair", color: "#f59e0b" };
    if (score === 3) return { level: 3, label: "Good", color: "#eab308" };
    if (score === 4) return { level: 4, label: "Strong", color: "#22c55e" };
    return { level: 5, label: "Excellent", color: "#16a34a" };
  };

  const strength = getStrength();

  // ─── Intro animation ───
  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        onComplete: () => setIntroDone(true),
      });

      gsap.set(".aw-reg-bg", { scale: 1.15, filter: "blur(24px)" });
      gsap.set(".aw-reg-card", { autoAlpha: 0, y: 60, scale: 0.96 });
      gsap.set(".aw-reg-glow", { opacity: 0, scale: 0.9 });

      tl.to(".aw-reg-bg", { scale: 1, filter: "blur(0px)", duration: 2.2, ease: "power2.out" })
        .to(".aw-reg-glow", { opacity: 1, scale: 1, duration: 1.5, ease: "power2.out" }, "-=1.4")
        .to(".aw-reg-card", { autoAlpha: 1, y: 0, scale: 1, duration: 1.1, ease: "power3.out" }, "-=0.9");
    });

    return () => ctx.revert();
  }, []);

  // ─── Mouse parallax ───
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!introDone) return;
    const x = (e.clientX / window.innerWidth - 0.5) * 2;
    const y = (e.clientY / window.innerHeight - 0.5) * 2;

    gsap.to(".aw-reg-bg", {
      x: -x * 12,
      y: -y * 12,
      duration: 1.2,
      ease: "power2.out",
      overwrite: "auto",
    });
    gsap.to(".aw-reg-glow", {
      x: -x * 25,
      y: -y * 25,
      duration: 1.2,
      ease: "power2.out",
      overwrite: "auto",
    });
    gsap.to(".aw-reg-card", {
      x: -x * 5,
      y: -y * 5,
      duration: 1.2,
      ease: "power2.out",
      overwrite: "auto",
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    setCapsLock(e.getModifierState && e.getModifierState("CapsLock"));
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (enableRegistration === false) {
      setError("User registration is currently disabled by administrator.");
      return;
    }

    if (!username.trim()) {
      setError("Username is required");
      return;
    }

    if (username.trim().length < 3) {
      setError("Username must be at least 3 characters");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setIsLoading(true);
    try {
      await axios.post("/api/auth/register", {
        username: username.trim(),
        password,
        confirmPassword,
      });
      setSuccess("Account created! Redirecting to sign in...");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err: any) {
      setError(err.response?.data?.error || "Registration failed.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="aw-reg-root" onMouseMove={handleMouseMove}>
      {/* ═══ Video Background (20% blur) ═══ */}
      <div className="aw-reg-bg-wrap">
        <video
          className="aw-reg-bg"
          src="https://motionbgs.com/media/10092/minecraft-fishing.960x540.mp4"
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
        />
        <div className="aw-reg-overlay" />
      </div>

      {/* ═══ Ambient glow ═══ */}
      <div className="aw-reg-glow aw-reg-glow-1" />
      <div className="aw-reg-glow aw-reg-glow-2" />

      {/* ═══ Grid ═══ */}
      <div className="aw-reg-grid" />

      {/* ═══ Grain ═══ */}
      <div className="aw-reg-grain" />

      {/* ═══ Floating orbs ═══ */}
      <div className="aw-reg-orb aw-reg-orb-1" />
      <div className="aw-reg-orb aw-reg-orb-2" />
      <div className="aw-reg-orb aw-reg-orb-3" />

      {/* ═══ Content ═══ */}
      <div className="aw-reg-content">
        {/* Brand Header */}
        <div className="aw-reg-brand">
          <div className="aw-reg-brand-icon">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M12 2L3 7v10l9 5 9-5V7l-9-5z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
              <path
                d="M12 12l9-5M12 12v10M12 12L3 7"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinejoin="round"
                opacity="0.6"
              />
            </svg>
          </div>
          <div className="aw-reg-brand-text">
            <span className="aw-reg-brand-name">{panelName || "AstroWax"}</span>
            <span className="aw-reg-brand-sub">CONTROL PANEL</span>
          </div>
        </div>

        {/* Glass Card */}
        <div className="aw-reg-card">
          <div className="aw-reg-card-corner tl" />
          <div className="aw-reg-card-corner tr" />
          <div className="aw-reg-card-corner bl" />
          <div className="aw-reg-card-corner br" />

          <div className="aw-reg-card-header">
            <h2 className="aw-reg-title">Create Account</h2>
            <p className="aw-reg-subtitle">Join the next generation of hosting</p>
          </div>

          <form onSubmit={handleRegister} className="aw-reg-form">
            {enableRegistration === false && (
              <div className="aw-reg-error">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 8v4M12 16h.01" />
                </svg>
                <span>Registration is disabled by administrator.</span>
              </div>
            )}

            {error && (
              <div className="aw-reg-error">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 8v4M12 16h.01" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="aw-reg-success">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span>{success}</span>
              </div>
            )}

            {/* Username */}
            <div className="aw-reg-field">
              <label className="aw-reg-label">Username</label>
              <div className="aw-reg-input-wrap">
                <span className="aw-reg-input-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" strokeLinecap="round" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </span>
                <input
                  type="text"
                  name="username"
                  required
                  placeholder="Choose a username"
                  className="aw-reg-input"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="username"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Password */}
            <div className="aw-reg-field">
              <label className="aw-reg-label">
                Password
                {capsLock && <span className="aw-reg-caps">CAPS LOCK ON</span>}
              </label>
              <div className="aw-reg-input-wrap">
                <span className="aw-reg-input-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <rect x="3" y="11" width="18" height="11" rx="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" strokeLinecap="round" />
                  </svg>
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  required
                  placeholder="Create a password"
                  className="aw-reg-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onKeyUp={handleKeyDown}
                  autoComplete="new-password"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="aw-reg-toggle"
                  onClick={() => setShowPassword((v) => !v)}
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" strokeLinecap="round" />
                      <line x1="1" y1="1" x2="23" y2="23" strokeLinecap="round" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" strokeLinecap="round" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>

              {/* Strength meter */}
              {password && (
                <div className="aw-reg-strength">
                  <div className="aw-reg-strength-bars">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <span
                        key={i}
                        className="aw-reg-strength-bar"
                        style={{
                          background:
                            i <= strength.level ? strength.color : "rgba(168, 85, 247, 0.15)",
                          boxShadow:
                            i <= strength.level ? `0 0 8px ${strength.color}80` : "none",
                        }}
                      />
                    ))}
                  </div>
                  <span
                    className="aw-reg-strength-label"
                    style={{ color: strength.color }}
                  >
                    {strength.label}
                  </span>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div className="aw-reg-field">
              <label className="aw-reg-label">Confirm Password</label>
              <div className="aw-reg-input-wrap">
                <span className="aw-reg-input-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <rect x="3" y="11" width="18" height="11" rx="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" strokeLinecap="round" />
                  </svg>
                </span>
                <input
                  type={showConfirm ? "text" : "password"}
                  name="confirmPassword"
                  required
                  placeholder="Re-enter your password"
                  className="aw-reg-input"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="aw-reg-toggle"
                  onClick={() => setShowConfirm((v) => !v)}
                  tabIndex={-1}
                >
                  {showConfirm ? (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" strokeLinecap="round" />
                      <line x1="1" y1="1" x2="23" y2="23" strokeLinecap="round" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" strokeLinecap="round" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
              {confirmPassword && password !== confirmPassword && (
                <p className="aw-reg-mismatch">Passwords do not match</p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="aw-reg-submit"
              disabled={
                isLoading ||
                !!success ||
                enableRegistration === false ||
                (!!confirmPassword && password !== confirmPassword)
              }
            >
              <span className="aw-reg-submit-text">
                {isLoading ? "Creating account..." : "Create Account"}
              </span>
              <span className="aw-reg-submit-arrow">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            </button>
          </form>

          <div className="aw-reg-footer">
            Already have an account?{" "}
            <Link to="/login" className="aw-reg-footer-link">
              Sign in
            </Link>
          </div>
        </div>

        {/* Bottom status */}
        <div className="aw-reg-status">
          <span className="aw-reg-status-dot" />
          <span>System Online • V1.80</span>
        </div>
      </div>

      {isLoading && <LoadingOverlay message="Creating account..." />}
    </div>
  );
}