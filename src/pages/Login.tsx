// @ts-nocheck
import React, { useState, useEffect } from "react";
import { LoadingOverlay } from "../components/LoadingOverlay";
import { useAuth } from "../context/AuthContext";
import { useSettings } from "../context/SettingsContext";
import { useNavigate, Link } from "react-router-dom";
import gsap from "gsap";
import axios from "axios";
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import "./Login.css";

// ============================================
// AstroWax Panel V1.80 — Login (Custom)
// Video Background + Glass Card + Parallax
// ============================================
export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [introDone, setIntroDone] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [capsLock, setCapsLock] = useState(false);

  const { login } = useAuth();
  const {
    panelName,
    enableLoginAnimation,
    enableRegistration,
    enableGoogleLogin,
    firebaseApiKey,
    firebaseAuthDomain,
    firebaseProjectId,
    firebaseStorageBucket,
    firebaseMessagingSenderId,
    firebaseAppId,
  } = useSettings();
  const navigate = useNavigate();

  // ─── Intro animation ───
  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        onComplete: () => setIntroDone(true),
      });

      if (enableLoginAnimation !== false) {
        gsap.set(".aw-login-bg", { scale: 1.15, filter: "blur(24px)" });
        gsap.set(".aw-login-card", { autoAlpha: 0, y: 60, scale: 0.96 });
        gsap.set(".aw-login-glow", { opacity: 0, scale: 0.9 });

        tl.to(".aw-login-bg", { scale: 1, filter: "blur(0px)", duration: 2.2, ease: "power2.out" })
          .to(".aw-login-glow", { opacity: 1, scale: 1, duration: 1.5, ease: "power2.out" }, "-=1.4")
          .to(".aw-login-card", { autoAlpha: 1, y: 0, scale: 1, duration: 1.1, ease: "power3.out" }, "-=0.9");
      } else {
        gsap.set(".aw-login-bg", { scale: 1, filter: "blur(0px)" });
        gsap.set(".aw-login-card", { autoAlpha: 1, y: 0, scale: 1 });
        gsap.set(".aw-login-glow", { opacity: 1, scale: 1 });
        setIntroDone(true);
      }
    });

    return () => ctx.revert();
  }, []);

  // ─── Mouse parallax ───
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!introDone) return;
    const x = (e.clientX / window.innerWidth - 0.5) * 2;
    const y = (e.clientY / window.innerHeight - 0.5) * 2;

    gsap.to(".aw-login-bg", {
      x: -x * 12,
      y: -y * 12,
      duration: 1.2,
      ease: "power2.out",
      overwrite: "auto",
    });
    gsap.to(".aw-login-glow", {
      x: -x * 25,
      y: -y * 25,
      duration: 1.2,
      ease: "power2.out",
      overwrite: "auto",
    });
    gsap.to(".aw-login-card", {
      x: -x * 5,
      y: -y * 5,
      duration: 1.2,
      ease: "power2.out",
      overwrite: "auto",
    });
  };

  // ─── Caps Lock detector ───
  const handleKeyDown = (e: React.KeyboardEvent) => {
    setCapsLock(e.getModifierState && e.getModifierState("CapsLock"));
  };

  // ─── Standard login ───
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await axios.post("/api/auth/login", { username, password });
      const { token, user } = res.data || {};

      // ✅ Validate response
      if (!token || !user || !user.id) {
        setError("Invalid server response. Please try again.");
        return;
      }

      login(token, user);
      navigate("/");
    } catch (err: any) {
      setError(err.response?.data?.error || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  // ─── Google login ───
  const handleGoogleLogin = async () => {
    if (!firebaseApiKey || !firebaseProjectId) {
      setError("Firebase Google Login is not configured by administrator yet.");
      return;
    }
    setIsLoading(true);
    setError("");

    try {
      const fbConfig = {
        apiKey: firebaseApiKey,
        authDomain: firebaseAuthDomain,
        projectId: firebaseProjectId,
        storageBucket: firebaseStorageBucket,
        messagingSenderId: firebaseMessagingSenderId,
        appId: firebaseAppId,
      };

      const app = getApps().length === 0 ? initializeApp(fbConfig) : getApp();
      const auth = getAuth(app);
      const provider = new GoogleAuthProvider();

      const result = await signInWithPopup(auth, provider);
      const googleUser = result.user;

      if (!googleUser.email) {
        throw new Error("No email associated with this Google account");
      }

      const res = await axios.post("/api/auth/google", {
        email: googleUser.email,
        googleId: googleUser.uid,
        name: googleUser.displayName || "",
        photoURL: googleUser.photoURL || "",
      });

      const { token, user } = res.data || {};
      if (!token || !user || !user.id) {
        setError("Invalid server response from Google auth.");
        return;
      }

      login(token, user);
      navigate("/");
    } catch (err: any) {
      console.error("Google Auth Error:", err);
      if (err.code === "auth/popup-closed-by-user") {
        setError("Google Login popup was closed before completing.");
      } else if (err.code === "auth/unauthorized-domain") {
        setError(
          "This domain is not authorized in Firebase Console -> Auth settings -> Authorized Domains."
        );
      } else if (
        err.code === "auth/too-many-requests" ||
        err.response?.status === 429 ||
        err.message?.includes("429")
      ) {
        setError("Too many login requests. Please wait a minute and try again.");
      } else {
        setError(
          err.response?.data?.error ||
            err.message ||
            "Google Authentication failed."
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="aw-login-root" onMouseMove={handleMouseMove}>
      {/* ═══ Video Background (20% blurred) ═══ */}
      <div className="aw-login-bg-wrap">
        <video
          className="aw-login-bg"
          src="https://motionbgs.com/media/10092/minecraft-fishing.960x540.mp4"
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
        />
        <div className="aw-login-overlay" />
      </div>

      {/* ═══ Ambient glow ═══ */}
      <div className="aw-login-glow aw-login-glow-1" />
      <div className="aw-login-glow aw-login-glow-2" />

      {/* ═══ Grid ═══ */}
      <div className="aw-login-grid" />

      {/* ═══ Grain ═══ */}
      <div className="aw-login-grain" />

      {/* ═══ Floating orbs ═══ */}
      <div className="aw-login-orb aw-orb-1" />
      <div className="aw-login-orb aw-orb-2" />
      <div className="aw-login-orb aw-orb-3" />

      {/* ═══ Content ═══ */}
      <div className="aw-login-content">
        {/* Brand Header */}
        <div className="aw-login-brand">
          <div className="aw-login-brand-icon">
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
          <div className="aw-login-brand-text">
            <span className="aw-login-brand-name">{panelName || "AstroWax"}</span>
            <span className="aw-login-brand-sub">CONTROL PANEL</span>
          </div>
        </div>

        {/* Glass Card */}
        <div className="aw-login-card">
          <div className="aw-login-card-corner tl" />
          <div className="aw-login-card-corner tr" />
          <div className="aw-login-card-corner bl" />
          <div className="aw-login-card-corner br" />

          <div className="aw-login-card-header">
            <h2 className="aw-login-title">Welcome Back</h2>
            <p className="aw-login-subtitle">Sign in to continue to your dashboard</p>
          </div>

          <form onSubmit={handleLogin} className="aw-login-form">
            {error && (
              <div className="aw-login-error">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 8v4M12 16h.01" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            {/* Username */}
            <div className="aw-login-field">
              <label className="aw-login-label">Username</label>
              <div className="aw-login-input-wrap">
                <span className="aw-login-input-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" strokeLinecap="round" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </span>
                <input
                  type="text"
                  name="username"
                  required
                  placeholder="Enter your username"
                  className="aw-login-input"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="username"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Password */}
            <div className="aw-login-field">
              <label className="aw-login-label">
                Password
                {capsLock && <span className="aw-caps-warn">CAPS LOCK ON</span>}
              </label>
              <div className="aw-login-input-wrap">
                <span className="aw-login-input-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <rect x="3" y="11" width="18" height="11" rx="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" strokeLinecap="round" />
                  </svg>
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  required
                  placeholder="Enter your password"
                  className="aw-login-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onKeyUp={handleKeyDown}
                  autoComplete="current-password"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="aw-login-toggle"
                  onClick={() => setShowPassword((v) => !v)}
                  tabIndex={-1}
                  aria-label={showPassword ? "Hide password" : "Show password"}
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
            </div>

            {/* Submit */}
            <button type="submit" className="aw-login-submit" disabled={isLoading}>
              <span className="aw-login-submit-text">
                {isLoading ? "Authenticating..." : "Sign In"}
              </span>
              <span className="aw-login-submit-arrow">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            </button>
          </form>

          {/* Google */}
          {enableGoogleLogin && (
            <>
              <div className="aw-login-divider">
                <span className="aw-login-divider-line" />
                <span className="aw-login-divider-text">OR</span>
                <span className="aw-login-divider-line" />
              </div>

              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={isLoading}
                className="aw-login-google"
              >
                <svg width="20" height="20" viewBox="0 0 24 24">
                  <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.3 9 5 12 5z" />
                  <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z" />
                  <path fill="#FBBC05" d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.3 0 15s.7 5.3 1.9 7.7l3.7-2.9z" />
                  <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.3-6.4-5.2L1.9 16C3.7 19.7 7.5 22.3 12 23z" />
                </svg>
                <span>Continue with Google</span>
              </button>
            </>
          )}

          {/* Register */}
          {enableRegistration !== false && (
            <div className="aw-login-footer">
              Don't have an account?{" "}
              <Link to="/register" className="aw-login-footer-link">
                Create one
              </Link>
            </div>
          )}
        </div>

        {/* Bottom status */}
        <div className="aw-login-status">
          <span className="aw-login-status-dot" />
          <span>System Online • V1.80</span>
        </div>
      </div>

      {isLoading && <LoadingOverlay message="Authenticating..." />}
    </div>
  );
}
