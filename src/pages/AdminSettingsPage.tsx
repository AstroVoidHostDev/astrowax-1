// @ts-nocheck
import AdminControls from '../components/AdminControls';
import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useSettings } from "../context/SettingsContext";
import { motion } from "framer-motion";
import {
  Check, User, Trash2, Layout, Upload, RefreshCw, Key,
  CheckCircle2, AlertCircle, ExternalLink, Cpu,
  Image as ImageIcon, Settings, ArrowLeft, Menu, X,
  Lock, Sparkles, Hexagon, Palette
} from "lucide-react";
import { Link } from "react-router-dom";
import { ImageCropper } from "../components/ImageCropper";
import { LoadingOverlay } from "../components/LoadingOverlay";
import { initializeApp, deleteApp, getApps } from "firebase/app";

// ============================================
// AstroWax Panel V1.80 — Admin Settings
// Glass + Purple Theme + 5 Premium Accents
// ============================================

const PREMIUM_THEMES = [
  {
    id: "purple",
    name: "AstroWax",
    gradient: "linear-gradient(135deg, #a855f7, #7e22ce)",
    glow: "rgba(168, 85, 247, 0.7)",
  },
  {
    id: "blue",
    name: "Cyber",
    gradient: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
    glow: "rgba(59, 130, 246, 0.7)",
  },
  {
    id: "emerald",
    name: "Emerald",
    gradient: "linear-gradient(135deg, #10b981, #047857)",
    glow: "rgba(16, 185, 129, 0.7)",
  },
  {
    id: "orange",
    name: "Sunset",
    gradient: "linear-gradient(135deg, #f97316, #c2410c)",
    glow: "rgba(249, 115, 22, 0.7)",
  },
  {
    id: "rose",
    name: "Rose",
    gradient: "linear-gradient(135deg, #f43f5e, #be123c)",
    glow: "rgba(244, 63, 94, 0.7)",
  },
];

const WALLPAPER_PRESETS = [
  {
    name: "PlayStation Blue",
    url: "https://4kwallpapers.com/images/walls/thumbs_2t/24671.jpg",
  },
  {
    name: "Dogecoin",
    url: "https://4kwallpapers.com/images/walls/thumbs_2t/18080.png",
  },
  {
    name: "ASUS ROG City",
    url: "https://4kwallpapers.com/images/walls/thumbs_2t/11603.jpg",
  },
  {
    name: "Xbox Pride",
    url: "https://4kwallpapers.com/images/walls/thumbs_2t/20829.jpg",
  },
];

export default function AdminSettingsPage(): React.ReactElement {
  const [activeTab, setActiveTab] = useState("branding");
  const [mobileOpen, setMobileOpen] = useState(false);

  const adminTabs = [
    { id: "branding", label: "Branding", icon: <Layout size={20} /> },
    { id: "features", label: "Features", icon: <Settings size={20} /> },
    { id: "runtime", label: "Runtime", icon: <Cpu size={20} /> },
    { id: "appearance", label: "Appearance", icon: <ImageIcon size={20} /> },
    { id: "auth", label: "Authentication", icon: <Key size={20} /> },
    { id: "users", label: "Users", icon: <User size={20} /> },
    { id: "system", label: "System", icon: <RefreshCw size={20} /> },
  ];

  const scrollToTab = (id: string) => {
    setActiveTab(id);
    setMobileOpen(false);
    const element = document.getElementById(id);
    if (element) element.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveTab(entry.target.id);
        });
      },
      { root: document.getElementById("settings-scroll-container"), rootMargin: "-10% 0px -60% 0px", threshold: 0 }
    );
    adminTabs.forEach((tab) => {
      const el = document.getElementById(tab.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  const { user, logout, updateUser } = useAuth();
  const {
    panelName, panelLogo, panelBackgroundImage, panelBackgroundBlur,
    enablePlayit, enableTutorial, enableLoginAnimation, enableRegistration,
    theme, setTheme,
    enableGoogleLogin, firebaseApiKey, firebaseAuthDomain, firebaseProjectId,
    firebaseStorageBucket, firebaseMessagingSenderId, firebaseAppId,
    defaultRuntime, setDefaultRuntime,
    isDevPanel, fetchSettings
  } = useSettings();

  const [users, setUsers] = useState<any[]>([]);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");

  const [newCustomUsername, setNewCustomUsername] = useState(user?.username || "");
  const [isChangingUsername, setIsChangingUsername] = useState(false);
  const [usernameMsg, setUsernameMsg] = useState<{ text: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    if (user?.username) setNewCustomUsername(user.username);
  }, [user?.username]);

  const handleChangeUsername = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomUsername || newCustomUsername.trim().length < 3) {
      setUsernameMsg({ text: "Username must be at least 3 characters", type: "error" });
      return;
    }
    setIsChangingUsername(true);
    setUsernameMsg(null);
    try {
      const res = await axios.put("/api/auth/username", { newUsername: newCustomUsername.trim() });
      if (updateUser) updateUser({ username: res.data.username });
      setUsernameMsg({ text: "Username updated successfully!", type: "success" });
      if (user.role === "admin" || user.role === "owner") fetchUsers();
    } catch (err: any) {
      setUsernameMsg({ text: err.response?.data?.error || "Failed to update username", type: "error" });
    } finally {
      setIsChangingUsername(false);
    }
  };

  const [newPanelName, setNewPanelName] = useState(panelName);
  const [newEnablePlayit, setNewEnablePlayit] = useState(enablePlayit);
  const [newEnableTutorial, setNewEnableTutorial] = useState(enableTutorial);
  const [newEnableLoginAnimation, setNewEnableLoginAnimation] = useState(enableLoginAnimation);
  const [newEnableRegistration, setNewEnableRegistration] = useState(enableRegistration);
  const [newTheme, setNewTheme] = useState(theme || 'purple');
  const [newDefaultRuntime, setNewDefaultRuntime] = useState(defaultRuntime || 'docker');
  const [isUpdatingRuntime, setIsUpdatingRuntime] = useState(false);
  const [runtimeStatusMsg, setRuntimeStatusMsg] = useState<{ text: string; type: "success" | "error" | "warning" } | null>(null);

  const [fbEnableGoogleLogin, setFbEnableGoogleLogin] = useState<boolean>(enableGoogleLogin || false);
  const [fbApiKey, setFbApiKey] = useState<string>(firebaseApiKey || "");
  const [fbAuthDomain, setFbAuthDomain] = useState<string>(firebaseAuthDomain || "");
  const [fbProjectId, setFbProjectId] = useState<string>(firebaseProjectId || "");
  const [fbStorageBucket, setFbStorageBucket] = useState<string>(firebaseStorageBucket || "");
  const [fbMessagingSenderId, setFbMessagingSenderId] = useState<string>(firebaseMessagingSenderId || "");
  const [fbAppId, setFbAppId] = useState<string>(firebaseAppId || "");
  const [isSavingFirebase, setIsSavingFirebase] = useState(false);
  const [fbStatusMsg, setFbStatusMsg] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [croppingType, setCroppingType] = useState<"logo" | "background" | null>(null);
  const [bgAspectRatio, setBgAspectRatio] = useState<number>(16 / 9);
  const [tempBgBlur, setTempBgBlur] = useState<number>(10);
  const [customBgUrlInput, setCustomBgUrlInput] = useState<string>("");
  const bgFileInputRef = useRef<HTMLInputElement>(null);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [adminUserNewPassword, setAdminUserNewPassword] = useState("");
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [isUpdatingLogo, setIsUpdatingLogo] = useState(false);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isUpdatingSystem, setIsUpdatingSystem] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // ============================================
  // 🔒 SYSTEM UPDATE — LOCKED (Coming Soon)
  // ============================================
  const handleSystemUpdate = async () => {
    alert(
      "🚧 System Update is currently disabled.\n\n" +
      "We're building a safer GitHub-based update system that will:\n\n" +
      "✅ Compare your panel files with the latest release\n" +
      "✅ Show exactly what will change\n" +
      "✅ Only update safe files (not your customizations)\n" +
      "✅ Display version diff before applying\n\n" +
      "Coming soon in V1.81!"
    );
    return;

    // ─────────────────────────────────────────
    // 🚀 FUTURE IMPLEMENTATION (when GitHub repo is ready)
    // ─────────────────────────────────────────
    // try {
    //   setIsUpdatingSystem(true);
    //   const res = await axios.post("/api/system/update-check");
    //   // Handle update response
    //   setIsUpdatingSystem(false);
    // } catch (e) {
    //   alert("Failed to check for updates.");
    //   setIsUpdatingSystem(false);
    // }
  };

  useEffect(() => {
    setNewPanelName(panelName);
    setNewEnablePlayit(enablePlayit);
    setNewEnableTutorial(enableTutorial);
    setNewEnableLoginAnimation(enableLoginAnimation);
    setNewEnableRegistration(enableRegistration);
    setNewTheme(theme || 'purple');
    setFbEnableGoogleLogin(enableGoogleLogin || false);
    setFbApiKey(firebaseApiKey || "");
    setFbAuthDomain(firebaseAuthDomain || "");
    setFbProjectId(firebaseProjectId || "");
    setFbStorageBucket(firebaseStorageBucket || "");
    setFbMessagingSenderId(firebaseMessagingSenderId || "");
    setFbAppId(firebaseAppId || "");
    setCustomBgUrlInput(panelBackgroundImage || "");
    setNewDefaultRuntime(defaultRuntime || 'docker');
  }, [defaultRuntime, panelName, panelBackgroundImage, enablePlayit, enableTutorial, enableLoginAnimation, enableRegistration, theme, enableGoogleLogin, firebaseApiKey, firebaseAuthDomain, firebaseProjectId, firebaseStorageBucket, firebaseMessagingSenderId, firebaseAppId]);

  const applyTheme = async (themeId: string) => {
    try {
      setNewTheme(themeId);
      setTheme(themeId);
      document.documentElement.setAttribute('data-theme', themeId);
      await axios.put("/api/system/settings", { theme: themeId });
      await fetchSettings();
    } catch (e) {
      console.error("Failed to apply theme", e);
    }
  };

  const handleSaveFirebaseSettings = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSavingFirebase(true);
    setFbStatusMsg(null);
    try {
      await axios.put("/api/system/settings", {
        enableGoogleLogin: fbEnableGoogleLogin,
        firebaseApiKey: fbApiKey,
        firebaseAuthDomain: fbAuthDomain,
        firebaseProjectId: fbProjectId,
        firebaseStorageBucket: fbStorageBucket,
        firebaseMessagingSenderId: fbMessagingSenderId,
        firebaseAppId: fbAppId
      });
      await fetchSettings();
      setFbStatusMsg({ text: "Firebase & Google Login settings saved successfully!", type: "success" });
    } catch (err: any) {
      setFbStatusMsg({ text: err.response?.data?.error || "Failed to save Firebase config", type: "error" });
    } finally {
      setIsSavingFirebase(false);
    }
  };

  const handleTestFirebaseConfig = async () => {
    setFbStatusMsg(null);
    if (!fbApiKey || !fbProjectId) {
      setFbStatusMsg({ text: "Please enter at least API Key and Project ID to test.", type: "error" });
      return;
    }
    try {
      const testAppName = "test-fb-app-" + Date.now();
      const testApp = initializeApp({
        apiKey: fbApiKey,
        authDomain: fbAuthDomain,
        projectId: fbProjectId,
        storageBucket: fbStorageBucket,
        messagingSenderId: fbMessagingSenderId,
        appId: fbAppId
      }, testAppName);
      await deleteApp(testApp);
      setFbStatusMsg({ text: "Firebase Configuration verified valid!", type: "success" });
    } catch (err: any) {
      setFbStatusMsg({ text: "Firebase config error: " + (err.message || String(err)), type: "error" });
    }
  };

  const fetchUsers = async () => {
    if (user.role !== "admin" && user.role !== "owner") return;
    try {
      const res = await axios.get("/api/system/users");
      setUsers(res.data);
    } catch (e) { }
  };

  useEffect(() => {
    fetchUsers();
    if (panelBackgroundBlur !== undefined) setTempBgBlur(panelBackgroundBlur);
  }, [user]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: "logo" | "background" = "logo") => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.addEventListener('load', async () => {
        const base64 = reader.result?.toString() || null;
        if (base64) {
          if (type === "logo") {
            setSelectedImage(base64);
            setCroppingType(type);
          } else if (type === "background") {
            setIsProcessing(true);
            try {
              await axios.put("/api/system/settings", { panelBackgroundImage: base64 });
              await fetchSettings();
            } catch (err) {
              console.error(err);
            } finally {
              setIsProcessing(false);
            }
          }
        }
      });
      reader.readAsDataURL(file);
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (bgFileInputRef.current) bgFileInputRef.current.value = "";
  };

  const handleCropComplete = async (croppedImageBase64: string) => {
    const type = croppingType;
    setSelectedImage(null);
    setCroppingType(null);
    if (type === "logo") {
      setIsUpdatingLogo(true);
      try {
        await axios.put("/api/system/settings", { panelLogo: croppedImageBase64 });
        await fetchSettings();
      } catch (err: any) {
        alert(err.response?.data?.error || "Error updating logo");
      } finally {
        setIsUpdatingLogo(false);
      }
    } else if (type === "background") {
      setIsProcessing(true);
      try {
        await axios.put("/api/system/settings", { panelBackgroundImage: croppedImageBase64 });
        await fetchSettings();
      } catch (err: any) {
        alert(err.response?.data?.error || "Error updating background");
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const createUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreatingUser(true);
    try {
      await axios.post("/api/system/users", { username, password, role });
      setUsername("");
      setPassword("");
      fetchUsers();
      alert("User created successfully");
    } catch (e: any) {
      alert(e.response?.data?.error || "Error creating user");
    } finally {
      setIsCreatingUser(false);
    }
  };

  const changeUserRole = async (id: string, newRole: string) => {
    try {
      await axios.put(`/api/system/users/${id}/role`, { newRole });
      fetchUsers();
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.error || "Failed to change role");
    }
  };

  const changeUserPassword = async (id: string) => {
    try {
      if (adminUserNewPassword.length < 8) {
        alert("Password must be at least 8 characters");
        return;
      }
      await axios.put(`/api/system/users/${id}/password`, { newPassword: adminUserNewPassword });
      alert("Password changed successfully");
      setEditingUserId(null);
      setAdminUserNewPassword("");
      if (user.id === id) logout();
    } catch (e: any) {
      alert(e.response?.data?.error || "Error changing password");
    }
  };

  const deleteUser = async (id: string) => {
    try {
      await axios.delete(`/api/system/users/${id}`);
      fetchUsers();
    } catch (e) { }
  };

  const renderGoogleFirebase = () => (
    <div className="aw-glass p-6 md:p-8 mt-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 relative z-10 border-b border-purple-500/20 pb-6">
        <div>
          <h2 className="text-xl font-bold flex items-center text-purple-200">
            <Key className="mr-3 text-purple-400 w-6 h-6" /> Google & Firebase Authentication
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Configure Firebase API Keys to enable 1-click Google Sign-In for admins and users.
          </p>
        </div>
        <div className="flex items-center gap-3 bg-black/40 p-2 rounded-xl border border-purple-500/25">
          <span className="text-xs font-semibold text-zinc-400">Enable Google Login:</span>
          <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
            <input
              type="checkbox"
              checked={fbEnableGoogleLogin}
              onChange={(e: any) => setFbEnableGoogleLogin(e.target.checked)}
              className="sr-only peer aw-toggle"
            />
            <div className="aw-toggle-track w-11 h-6 bg-zinc-800 border border-purple-500/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
          </label>
        </div>
      </div>

      <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/25 mb-6 text-xs text-purple-200/90 leading-relaxed">
        <div className="font-bold text-purple-300 text-sm mb-1 flex items-center gap-2">
          <Sparkles size={16} /> How to Setup Google Login in 1 Minute (No Code Needed!):
        </div>
        <ol className="list-decimal list-inside space-y-1 mt-2 text-zinc-400">
          <li>Open <a href="https://console.firebase.google.com" target="_blank" rel="noreferrer" className="text-purple-400 underline font-medium hover:text-purple-200 inline-flex items-center gap-1">Firebase Console <ExternalLink size={12} /></a> and create a free project.</li>
          <li>Go to <strong>Authentication → Sign-in method</strong> and enable <strong>Google</strong>.</li>
          <li>Under <strong>Settings → Authorized Domains</strong>, add your panel's domain or IP address.</li>
          <li>Go to <strong>Project Settings → General → Your apps</strong>, create a Web App and copy the Firebase config credentials below!</li>
        </ol>
      </div>

      {fbStatusMsg && (
        <div className={`p-4 rounded-xl mb-6 flex items-center gap-3 text-sm font-medium ${fbStatusMsg.type === "success" ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400" : "bg-rose-500/10 border border-rose-500/30 text-rose-400"}`}>
          {fbStatusMsg.type === "success" ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{fbStatusMsg.text}</span>
        </div>
      )}

      <form onSubmit={handleSaveFirebaseSettings} className="space-y-4 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { label: "Firebase API Key", value: fbApiKey, set: setFbApiKey, placeholder: "AIzaSy...", required: true },
            { label: "Auth Domain", value: fbAuthDomain, set: setFbAuthDomain, placeholder: "your-project.firebaseapp.com", required: true },
            { label: "Project ID", value: fbProjectId, set: setFbProjectId, placeholder: "your-project-id", required: true },
            { label: "Storage Bucket (Optional)", value: fbStorageBucket, set: setFbStorageBucket, placeholder: "your-project.appspot.com", required: false },
            { label: "Messaging Sender ID (Optional)", value: fbMessagingSenderId, set: setFbMessagingSenderId, placeholder: "1234567890", required: false },
            { label: "App ID (Optional)", value: fbAppId, set: setFbAppId, placeholder: "1:1234567890:web:abcdef", required: false },
          ].map((field) => (
            <div key={field.label}>
              <label className="block text-xs font-semibold text-purple-300 mb-1.5 uppercase tracking-wider">
                {field.label} {field.required && <span className="text-purple-400">*</span>}
              </label>
              <input
                type="text"
                placeholder={field.placeholder}
                value={field.value}
                onChange={(e: any) => field.set(e.target.value)}
                className="aw-input w-full rounded-xl px-4 py-2.5 text-sm font-mono"
              />
            </div>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-4">
          <button
            type="submit"
            disabled={isSavingFirebase}
            className="aw-btn-primary px-6 py-2.5 rounded-xl font-bold disabled:opacity-50"
          >
            {isSavingFirebase ? "Saving Config..." : "Save Firebase Credentials"}
          </button>

          <button
            type="button"
            onClick={handleTestFirebaseConfig}
            className="aw-btn-ghost px-5 py-2.5 rounded-xl font-semibold"
          >
            Test Connection
          </button>
        </div>
      </form>
    </div>
  );

  if (!user || (user.role !== "admin" && user.role !== "owner")) {
    return (
      <div className="w-full flex items-center justify-center py-20 text-zinc-400">
        You do not have permission to view this page.
      </div>
    );
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        .aw-glass {
          background: linear-gradient(135deg, rgba(20,12,35,.75), rgba(13,8,25,.9));
          backdrop-filter: blur(16px) saturate(1.4);
          -webkit-backdrop-filter: blur(16px) saturate(1.4);
          border: 1px solid rgba(168,85,247,.25);
          border-radius: 20px;
          position: relative;
          overflow: hidden;
          transition: all .3s cubic-bezier(.16,1,.3,1);
        }
        .aw-glass::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(168,85,247,.6), rgba(255,255,255,.3), rgba(168,85,247,.6), transparent);
          pointer-events: none;
          z-index: 2;
        }
        .aw-glass:hover {
          border-color: rgba(168,85,247,.4);
        }
        .aw-input {
          background: rgba(0,0,0,.5);
          border: 1px solid rgba(168,85,247,.25);
          color: #e9d5ff;
          transition: all .25s cubic-bezier(.16,1,.3,1);
        }
        .aw-input:focus {
          border-color: rgba(168,85,247,.6) !important;
          box-shadow: 0 0 0 3px rgba(168,85,247,.1), 0 0 20px -4px rgba(168,85,247,.4) !important;
          outline: none !important;
        }
        .aw-input::placeholder { color: rgba(161,161,170,.5); }
        .aw-btn-primary {
          background: linear-gradient(135deg, #a855f7, #7e22ce);
          color: #fff;
          border: none;
          box-shadow: 0 4px 16px -4px rgba(168,85,247,.6);
          transition: all .25s cubic-bezier(.16,1,.3,1);
        }
        .aw-btn-primary:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px -4px rgba(168,85,247,.8);
        }
        .aw-btn-primary:active:not(:disabled) { transform: translateY(0) scale(.98); }
        .aw-btn-ghost {
          background: rgba(0,0,0,.4);
          border: 1px solid rgba(168,85,247,.25);
          color: #c084fc;
          transition: all .25s cubic-bezier(.16,1,.3,1);
        }
        .aw-btn-ghost:hover:not(:disabled) {
          color: #e9d5ff;
          border-color: rgba(168,85,247,.5);
          transform: translateY(-1px);
        }
        .aw-tab-active {
          background: linear-gradient(135deg, rgba(168,85,247,.2), rgba(126,34,206,.08)) !important;
          border: 1px solid rgba(168,85,247,.4) !important;
          color: #e9d5ff !important;
        }
        .aw-tab-active .aw-tab-icon { color: #c084fc !important; }
        .aw-toggle:checked + .aw-toggle-track {
          background: linear-gradient(135deg, #a855f7, #7e22ce);
          box-shadow: 0 0 12px -2px rgba(168,85,247,.7);
        }
        .aw-feature-row {
          background: rgba(0,0,0,.35);
          border: 1px solid rgba(168,85,247,.15);
          transition: all .25s cubic-bezier(.16,1,.3,1);
        }
        .aw-feature-row:hover {
          border-color: rgba(168,85,247,.35);
        }
        .aw-scroll::-webkit-scrollbar { width: 8px; }
        .aw-scroll::-webkit-scrollbar-track { background: rgba(0,0,0,.3); }
        .aw-scroll::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, #a855f7, #7e22ce);
          border-radius: 4px;
        }
        .aw-settings-header {
          background: linear-gradient(135deg, rgba(20,12,35,.75), rgba(13,8,25,.9));
          backdrop-filter: blur(16px);
          border-bottom: 1px solid rgba(168,85,247,.25);
        }
        .aw-settings-sidebar {
          background: linear-gradient(180deg, rgba(15,8,28,.85) 0%, rgba(10,6,18,.95) 100%);
          backdrop-filter: blur(20px) saturate(1.4);
          border-right: 1px solid rgba(168,85,247,.25);
        }

        /* ═══ PREMIUM THEME SWATCHES ═══ */
        .aw-theme-swatch {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          padding: 12px 8px;
          border-radius: 16px;
          background: rgba(0,0,0,.4);
          border: 2px solid rgba(168,85,247,.15);
          cursor: pointer;
          transition: all .3s cubic-bezier(.16,1,.3,1);
        }
        .aw-theme-swatch:hover {
          transform: translateY(-2px) scale(1.02);
          border-color: rgba(168,85,247,.4);
        }
        .aw-theme-swatch.active {
          background: rgba(168,85,247,.15);
          border-color: rgba(168,85,247,.6);
          box-shadow: 0 0 24px -8px rgba(168,85,247,.5);
          transform: scale(1.05);
        }
        .aw-theme-circle {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all .3s cubic-bezier(.16,1,.3,1);
        }
        .aw-theme-label {
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: .1em;
          color: #71717a;
          transition: color .2s ease;
        }
        .aw-theme-swatch.active .aw-theme-label { color: #e9d5ff; }
        .aw-theme-swatch:hover .aw-theme-label { color: #c084fc; }

        /* ═══ WALLPAPER PRESETS ═══ */
        .aw-wallpaper-preset {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px;
          border-radius: 12px;
          background: rgba(0,0,0,.4);
          border: 1px solid rgba(168,85,247,.2);
          cursor: pointer;
          transition: all .25s cubic-bezier(.16,1,.3,1);
          text-align: left;
        }
        .aw-wallpaper-preset:hover {
          border-color: rgba(168,85,247,.5);
          background: rgba(168,85,247,.1);
          transform: translateY(-1px);
        }

        /* ═══ COMING SOON BANNER ═══ */
        .aw-coming-soon {
          background: linear-gradient(135deg, rgba(245,158,11,.08), rgba(245,158,11,.02));
          border: 1px solid rgba(245,158,11,.3);
          border-radius: 14px;
          position: relative;
          overflow: hidden;
        }
        .aw-coming-soon::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(245,158,11,.6), rgba(255,255,255,.2), rgba(245,158,11,.6), transparent);
        }
      `}} />

      <div className="flex h-[100dvh] w-full bg-transparent text-purple-100 font-sans overflow-hidden selection:bg-purple-500/30">
        {mobileOpen && (
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-md z-[60] md:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}

        <div className={`fixed inset-y-0 left-0 z-[70] transform flex-shrink-0 aw-settings-sidebar transition-transform duration-300 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 w-64 h-full flex flex-col`}>
          <div className="h-16 flex items-center justify-between border-b border-purple-500/20 px-6 flex-shrink-0">
            <span className="font-display font-bold text-lg tracking-wide uppercase flex items-center gap-1.5">
              <span className="text-purple-400">ADMIN</span>
              <span className="text-zinc-500 font-medium">PANEL</span>
              <Hexagon size={12} className="text-purple-500" />
            </span>
            <button onClick={() => setMobileOpen(false)} className="md:hidden text-zinc-400 hover:text-white transition-colors">
              <X size={20} />
            </button>
          </div>

          <nav className="flex-1 w-full px-3 py-6 space-y-1.5 overflow-y-auto aw-scroll">
            <p className="px-3 mb-4 font-mono text-[10px] text-purple-400/60 tracking-widest uppercase">Settings</p>

            {adminTabs.map(tab => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => scrollToTab(tab.id)}
                  className={`relative flex w-full items-center px-3 py-3 rounded-xl transition-all group overflow-hidden ${
                    isActive ? 'aw-tab-active' : 'hover:bg-purple-500/8 border border-transparent'
                  }`}
                >
                  <div className={`relative z-10 transition-colors duration-200 aw-tab-icon ${isActive ? 'text-purple-400' : 'text-zinc-500 group-hover:text-purple-300'}`}>
                    {tab.icon}
                  </div>
                  <span className={`ml-3 relative z-10 font-mono text-xs tracking-wider transition-colors duration-200 ${isActive ? 'text-purple-200 font-semibold' : 'text-zinc-500 group-hover:text-purple-200'}`}>
                    {tab.label.toUpperCase()}
                  </span>
                </button>
              );
            })}

            <div className="mt-8 pt-4">
              <Link to="/" className="relative flex items-center px-3 py-3 rounded-xl transition-colors group hover:bg-purple-500/8">
                <div className="relative z-10 text-zinc-500 group-hover:text-purple-300 transition-colors">
                  <ArrowLeft size={20} />
                </div>
                <span className="ml-3 font-mono text-xs tracking-wider transition-colors text-zinc-500 group-hover:text-purple-200">BACK TO APP</span>
              </Link>
            </div>
          </nav>
        </div>

        <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden relative bg-transparent">
          <header className="sticky top-0 z-40 aw-settings-header flex-shrink-0 h-16 flex items-center px-4 md:px-8">
            <button
              onClick={() => setMobileOpen(true)}
              className="md:hidden p-2 -ml-2 mr-3 text-zinc-400 hover:text-purple-300 hover:bg-purple-500/10 rounded-lg transition-colors flex items-center justify-center"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="font-display font-bold text-xl uppercase tracking-wide flex items-center gap-2 text-purple-200">
              {adminTabs.find(t => t.id === activeTab)?.label}
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-mono uppercase tracking-widest bg-purple-500/10 border border-purple-500/30 text-purple-400">
                <Hexagon size={9} />
                ASTROWAX
              </span>
            </h1>
          </header>

          <main id="settings-scroll-container" className="flex-1 w-full h-full relative z-0 overflow-x-hidden overflow-y-auto pb-safe aw-scroll p-4 sm:p-6 md:p-8">
            <div className="max-w-4xl mx-auto w-full pb-12">
              <div className="flex flex-col gap-8 pt-4">

                {/* ═══════════════════════════════════════
                    BRANDING SECTION
                ═══════════════════════════════════════ */}
                <section id="branding" className="scroll-mt-24 aw-glass p-6 md:p-8">
                  <h2 className="text-xl font-bold mb-6 flex items-center text-purple-200 relative z-10">
                    <Layout className="mr-3 text-purple-400 w-5 h-5" /> Branding
                  </h2>
                  <div className="flex flex-col gap-8 relative z-10">
                    <form
                      onSubmit={async (e: any) => {
                        e.preventDefault();
                        setIsSavingSettings(true);
                        try {
                          await axios.put("/api/system/settings", { panelName: newPanelName });
                          fetchSettings();
                        } catch (err: any) {
                          alert(err.response?.data?.error || "Error updating settings");
                        } finally {
                          setIsSavingSettings(false);
                        }
                      }}
                    >
                      <label className="block text-xs font-semibold text-purple-300 mb-2 uppercase tracking-wider">Panel Name</label>
                      <div className="flex gap-3">
                        <input
                          required
                          value={newPanelName}
                          onChange={(e: any) => setNewPanelName(e.target.value)}
                          type="text"
                          placeholder="Enter panel name"
                          className="aw-input flex-1 rounded-xl px-4 py-2.5"
                        />
                        <button disabled={isSavingSettings} type="submit" className="aw-btn-primary px-6 py-2.5 rounded-xl font-semibold whitespace-nowrap disabled:opacity-50">
                          {isSavingSettings ? "Saving..." : "Save"}
                        </button>
                      </div>
                    </form>

                    <div>
                      <label className="block text-xs font-semibold text-purple-300 mb-3 uppercase tracking-wider">Panel Logo</label>
                      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
                        <div className="w-20 h-20 rounded-2xl bg-black/40 border border-purple-500/25 flex items-center justify-center overflow-hidden flex-shrink-0 relative group">
                          {panelLogo ? (
                            <img src={panelLogo} alt="Panel Logo" className="w-full h-full object-cover" />
                          ) : (
                            <Layout className="w-8 h-8 text-purple-400/40" />
                          )}
                          {panelLogo && (
                            <button
                              onClick={async () => {
                                try {
                                  await axios.put("/api/system/settings", { panelLogo: "" });
                                  fetchSettings();
                                } catch (e) { }
                              }}
                              className="absolute inset-0 bg-rose-500/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm"
                              title="Remove logo"
                            >
                              <Trash2 size={20} className="text-white" />
                            </button>
                          )}
                        </div>

                        <div className="flex-1 w-full text-center sm:text-left">
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            ref={fileInputRef}
                            onChange={(e: any) => handleFileChange(e, "logo")}
                          />
                          <button
                            disabled={isUpdatingLogo}
                            onClick={() => fileInputRef.current?.click()}
                            className="aw-btn-ghost inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-medium disabled:opacity-50 w-full sm:w-auto mb-2"
                          >
                            {isUpdatingLogo ? <div className="w-4 h-4 rounded-full border-2 border-purple-400/30 border-t-purple-400 animate-spin"></div> : <Upload size={18} />}
                            {isUpdatingLogo ? "Uploading..." : (panelLogo ? "Replace Logo" : "Upload Logo")}
                          </button>
                          <p className="text-xs text-zinc-500">We recommend a square image, PNG or JPG format, at least 256x256px.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                {/* ═══════════════════════════════════════
                    FEATURES SECTION
                ═══════════════════════════════════════ */}
                <section id="features" className="scroll-mt-24 aw-glass p-6 md:p-8">
                  <h2 className="text-xl font-bold mb-6 flex items-center text-purple-200 relative z-10">
                    <Settings className="mr-3 text-purple-400 w-5 h-5" /> Features
                  </h2>
                  <div className="flex flex-col gap-4 relative z-10">

                    {[
                      { key: 'playit', title: 'Playit Tunnel Integration', desc: 'Allow users to expose their local servers to the internet using playit.gg tunnels.', value: newEnablePlayit, setter: setNewEnablePlayit, apiKey: 'enablePlayit' },
                      { key: 'tutorial', title: 'Onboarding Tutorial', desc: 'Show a guided tour to new users when they log in for the first time.', value: newEnableTutorial, setter: setNewEnableTutorial, apiKey: 'enableTutorial' },
                      { key: 'loginanim', title: 'Cinematic Login Intro', desc: 'Enable the animated sequence on the login screen.', value: newEnableLoginAnimation, setter: setNewEnableLoginAnimation, apiKey: 'enableLoginAnimation' },
                      { key: 'reg', title: 'User Registration', desc: 'Allow new users to register an account on the panel.', value: newEnableRegistration, setter: setNewEnableRegistration, apiKey: 'enableRegistration' },
                    ].map(item => (
                      <div key={item.key} className="aw-feature-row flex items-start justify-between gap-4 p-4 rounded-2xl">
                        <div>
                          <h3 className="font-semibold text-purple-200 text-sm">{item.title}</h3>
                          <p className="text-xs text-zinc-500 mt-1">{item.desc}</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer flex-shrink-0 mt-1">
                          <input
                            type="checkbox"
                            checked={item.value}
                            onChange={async (e: any) => {
                              const val = e.target.checked;
                              item.setter(val);
                              try {
                                await axios.put("/api/system/settings", { [item.apiKey]: val });
                                fetchSettings();
                              } catch (err) { console.error(err); }
                            }}
                            className="sr-only peer aw-toggle"
                          />
                          <div className="aw-toggle-track w-11 h-6 bg-zinc-800 border border-purple-500/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                        </label>
                      </div>
                    ))}
                  </div>
                </section>

                {/* ═══════════════════════════════════════
                    RUNTIME SECTION
                ═══════════════════════════════════════ */}
                <section id="runtime" className="scroll-mt-24 aw-glass p-6 md:p-8">
                  <div className="flex items-center justify-between mb-6 relative z-10 flex-wrap gap-3">
                    <h2 className="text-xl font-bold flex items-center text-purple-200">
                      <Cpu className="mr-3 text-purple-400 w-5 h-5" /> Runtime Engine
                    </h2>
                    {!isDevPanel ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[10px] font-mono font-medium uppercase bg-amber-500/10 text-amber-400 border border-amber-500/25">
                        <Lock className="w-3 h-3" /> Main Panel (Locked)
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[10px] font-mono font-medium uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
                        Developer Mode (Unlocked)
                      </span>
                    )}
                  </div>
                  <div className="relative z-10 space-y-6">
                    <div>
                      <h4 className="font-semibold text-purple-200 flex items-center gap-2">Default Server Runtime</h4>
                      <p className="text-xs text-zinc-500 mt-1 mb-4">
                        Execution environment for <strong className="text-purple-300">newly created servers</strong>.
                      </p>

                      {!isDevPanel && (
                        <div className="mb-5 p-4 rounded-xl bg-black/60 border border-amber-500/25 text-xs text-zinc-300 flex items-start gap-3">
                          <Lock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                          <div>
                            <p className="font-semibold text-white">Default Runtime Locked on Main Panel</p>
                            <p className="mt-1 text-zinc-400 leading-relaxed">
                              The runtime engine is locked to the host installation default (<strong className="text-amber-300 uppercase">{newDefaultRuntime === 'local' ? 'Local Process' : 'Docker Container'}</strong>). Changing default runtime can only be done during panel installation/reinstallation (<code className="text-zinc-300">bash install.sh</code>) or via the Developer Panel (Port 3000).
                            </p>
                          </div>
                        </div>
                      )}

                      {runtimeStatusMsg && (
                        <div className={`mb-4 p-3 rounded-xl text-sm font-medium border flex items-center gap-2 ${runtimeStatusMsg.type === "success"
                            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                            : runtimeStatusMsg.type === "warning"
                              ? "bg-amber-500/10 border-amber-500/30 text-amber-400"
                              : "bg-rose-500/10 border-rose-500/30 text-rose-400"
                          }`}>
                          <AlertCircle className="w-4 h-4 shrink-0" />
                          <span>{runtimeStatusMsg.text}</span>
                        </div>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {[
                          { value: 'docker', label: 'Docker (Container Isolation)', desc: 'Runs server workloads in sandboxed Docker containers. Full port isolation, PTY terminal support, high security.', engine: 'Docker Engine', badge: 'Isolated', color: 'purple' },
                          { value: 'local', label: 'Local Process (Direct Process)', desc: 'Runs server workloads directly on the host system via Node.js process spawning. Ideal for environments without Docker.', engine: 'Host Java / Node Execution', badge: 'Direct Host', color: 'amber' },
                        ].map(opt => {
                          const isActive = newDefaultRuntime === opt.value;
                          const isDisabled = !isDevPanel;
                          const colorClass = opt.color === 'purple' ? 'purple' : 'amber';
                          return (
                            <button
                              key={opt.value}
                              type="button"
                              disabled={isDisabled || isUpdatingRuntime}
                              onClick={async () => {
                                if (!isDevPanel) return;
                                setIsUpdatingRuntime(true);
                                setRuntimeStatusMsg(null);
                                setNewDefaultRuntime(opt.value);
                                if (setDefaultRuntime) setDefaultRuntime(opt.value);
                                try {
                                  const token = localStorage.getItem("astrowax_token") || localStorage.getItem("jtg_token") || localStorage.getItem("token");
                                  const headers: any = {};
                                  if (token) headers["Authorization"] = `Bearer ${token}`;
                                  await axios.put("/api/system/settings", { defaultRuntime: opt.value }, { headers });
                                  await fetchSettings();
                                  setRuntimeStatusMsg({ text: `Default runtime updated to ${opt.label}.`, type: "success" });
                                } catch (err: any) {
                                  setRuntimeStatusMsg({ text: err.response?.data?.error || err.message || "Failed to update runtime", type: "error" });
                                } finally {
                                  setIsUpdatingRuntime(false);
                                }
                              }}
                              className={`p-5 rounded-2xl border text-left transition-all relative overflow-hidden flex flex-col justify-between ${
                                isActive
                                  ? colorClass === 'purple'
                                    ? 'bg-purple-500/15 border-purple-500 shadow-lg shadow-purple-500/10 ring-1 ring-purple-500'
                                    : 'bg-amber-500/15 border-amber-500 shadow-lg shadow-amber-500/10 ring-1 ring-amber-500'
                                  : isDisabled
                                    ? 'bg-black/30 border-purple-500/10 opacity-40 cursor-not-allowed filter grayscale pointer-events-none'
                                    : 'bg-black/40 border-purple-500/20 hover:border-purple-500/40 hover:bg-black/50'
                              } ${isDisabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                            >
                              <div>
                                <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                                  <span className={`text-sm font-bold flex items-center gap-2 ${isActive ? colorClass === 'purple' ? 'text-purple-300' : 'text-amber-300' : 'text-purple-100'}`}>
                                    {opt.label}
                                  </span>
                                  {isActive && (
                                    <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-full font-semibold flex items-center gap-1 ${
                                      isDisabled
                                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                        : colorClass === 'purple'
                                          ? 'bg-gradient-to-r from-purple-500 to-purple-700 text-white'
                                          : 'bg-amber-500 text-black'
                                    }`}>
                                      {isDisabled && <Lock className="w-2.5 h-2.5" />}
                                      {isDisabled ? 'Installed Default' : 'Active'}
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-zinc-500 leading-relaxed">{opt.desc}</p>
                              </div>
                              <div className="mt-4 pt-3 border-t border-purple-500/15 flex items-center justify-between text-[11px] text-zinc-500">
                                <span>{opt.engine}</span>
                                <span className={`font-mono font-semibold ${colorClass === 'purple' ? 'text-purple-400' : 'text-amber-400'}`}>{opt.badge}</span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-black/40 border border-purple-500/20 text-xs text-zinc-400 space-y-1">
                      <p className="font-semibold text-purple-200">💡 How Runtime Configuration Works:</p>
                      <p>• On the <strong>Main Panel</strong>, runtime is locked to what was configured during panel installation/reinstallation (<code className="text-purple-300">bash install.sh</code>).</p>
                      <p>• Dynamic runtime switching and per-server conversion are strictly reserved for the <strong>Developer Panel (Port 3000)</strong>.</p>
                    </div>
                  </div>
                </section>

                {/* ═══════════════════════════════════════
                    APPEARANCE SECTION
                ═══════════════════════════════════════ */}
                <section id="appearance" className="scroll-mt-24 aw-glass p-6 md:p-8">
                  <h2 className="text-xl font-bold mb-6 flex items-center text-purple-200 relative z-10">
                    <ImageIcon className="mr-3 text-purple-400 w-5 h-5" /> Appearance
                  </h2>
                  <div className="relative z-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-6">
                        <div>
                          <label className="block text-xs font-semibold text-purple-300 mb-3 uppercase tracking-wider">Custom Dashboard Background</label>
                          <div className="flex gap-4 items-end">
                            <div className="w-32 h-20 rounded-xl border-2 border-dashed border-purple-500/30 bg-black/40 overflow-hidden relative group flex-shrink-0 flex items-center justify-center">
                              {panelBackgroundImage ? (
                                <img src={panelBackgroundImage} alt="Background Preview" className="w-full h-full object-cover" style={{ filter: `blur(${panelBackgroundBlur}px)` }} />
                              ) : (
                                <ImageIcon className="w-6 h-6 text-purple-400/40" />
                              )}
                            </div>
                            <div className="flex-1 space-y-2">
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                ref={bgFileInputRef}
                                onChange={(e: any) => handleFileChange(e, "background")}
                              />
                              <button
                                disabled={isProcessing}
                                onClick={() => bgFileInputRef.current?.click()}
                                className="aw-btn-primary w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-medium disabled:opacity-50 text-sm"
                              >
                                {isProcessing ? <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin"></div> : <Upload size={16} />}
                                {isProcessing ? "Uploading..." : "Upload Image"}
                              </button>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 pt-2 border-t border-purple-500/15">
                          <button
                            disabled={isProcessing}
                            onClick={async () => {
                              setIsProcessing(true);
                              try {
                                await axios.put("/api/system/settings", { panelBackgroundImage: "", panelBackgroundBlur: 0 });
                                setCustomBgUrlInput("");
                                await fetchSettings();
                              } catch (e) { } finally {
                                setIsProcessing(false);
                              }
                            }}
                            className="aw-btn-ghost flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm"
                          >
                            Reset
                          </button>
                        </div>

                        <div className="space-y-2 pt-2">
                          <label className="block text-xs font-medium text-purple-300">Or Enter Custom Image URL</label>
                          <div className="flex gap-2">
                            <input
                              type="url"
                              placeholder="https://example.com/wallpaper.jpg"
                              value={customBgUrlInput}
                              onChange={(e) => setCustomBgUrlInput(e.target.value)}
                              className="aw-input flex-1 rounded-xl px-3 py-2 text-sm"
                            />
                            <button
                              onClick={async () => {
                                if (!customBgUrlInput.trim()) return;
                                setIsProcessing(true);
                                try {
                                  await axios.put("/api/system/settings", { panelBackgroundImage: customBgUrlInput.trim() });
                                  await fetchSettings();
                                } catch (e) { } finally {
                                  setIsProcessing(false);
                                }
                              }}
                              className="aw-btn-ghost px-4 py-2 rounded-xl text-sm"
                            >
                              Apply URL
                            </button>
                          </div>
                        </div>

                        {/* ═══ PREMIUM COLOR THEMES ═══ */}
                        <div className="space-y-4 pt-6 border-t border-purple-500/15">
                          <div>
                            <label className="block text-xs font-bold text-purple-300 uppercase tracking-widest flex items-center gap-2">
                              <Palette size={14} />
                              Premium Accent Theme
                            </label>
                            <p className="text-xs text-zinc-500 mt-1 mb-4">
                              Choose from 5 hand-crafted gradient themes. Applies instantly.
                            </p>
                          </div>
                          <div className="grid grid-cols-5 gap-2">
                            {PREMIUM_THEMES.map((t) => {
                              const isActive = (newTheme || theme) === t.id;
                              return (
                                <button
                                  key={t.id}
                                  onClick={() => applyTheme(t.id)}
                                  className={`aw-theme-swatch ${isActive ? 'active' : ''}`}
                                  title={t.name}
                                >
                                  <div
                                    className="aw-theme-circle"
                                    style={{
                                      background: t.gradient,
                                      boxShadow: isActive
                                        ? `0 0 24px -4px ${t.glow}, inset 0 1px 0 rgba(255,255,255,.3)`
                                        : `0 4px 12px -4px ${t.glow}, inset 0 1px 0 rgba(255,255,255,.2)`
                                    }}
                                  >
                                    {isActive && <Check size={18} className="text-white" strokeWidth={3} />}
                                  </div>
                                  <span className="aw-theme-label">{t.name}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-6 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <label className="text-xs font-bold text-purple-300 uppercase tracking-widest">Background Blur ({tempBgBlur}px)</label>
                            <span className="text-xs text-zinc-500">{tempBgBlur === 0 ? "Sharp" : tempBgBlur > 20 ? "Heavy Blur" : "Soft Blur"}</span>
                          </div>
                          <p className="text-xs text-zinc-500 mb-4">Adjust background blur for crisp dashboard readability.</p>
                          <input
                            type="range"
                            min="0"
                            max="50"
                            value={tempBgBlur}
                            onChange={(e: any) => setTempBgBlur(Number(e.target.value))}
                            onMouseUp={async () => {
                              setIsProcessing(true);
                              try {
                                await axios.put("/api/system/settings", { panelBackgroundBlur: tempBgBlur });
                                await fetchSettings();
                              } catch (e) { } finally {
                                setIsProcessing(false);
                              }
                            }}
                            onTouchEnd={async () => {
                              setIsProcessing(true);
                              try {
                                await axios.put("/api/system/settings", { panelBackgroundBlur: tempBgBlur });
                                await fetchSettings();
                              } catch (e) { } finally {
                                setIsProcessing(false);
                              }
                            }}
                            className="w-full accent-purple-500"
                          />
                        </div>

                        {/* ═══ WALLPAPER PRESETS ═══ */}
                        <div className="space-y-3 pt-4 border-t border-purple-500/15">
                          <label className="block text-xs font-bold text-purple-300 uppercase tracking-widest">Quick Wallpaper Presets</label>
                          <div className="grid grid-cols-2 gap-2">
                            {WALLPAPER_PRESETS.map((preset) => (
                              <button
                                key={preset.name}
                                onClick={async () => {
                                  setIsProcessing(true);
                                  setCustomBgUrlInput(preset.url);
                                  try {
                                    await axios.put("/api/system/settings", { panelBackgroundImage: preset.url });
                                    await fetchSettings();
                                  } catch (e) { } finally {
                                    setIsProcessing(false);
                                  }
                                }}
                                className="aw-wallpaper-preset group"
                              >
                                <img
                                  src={preset.url}
                                  alt={preset.name}
                                  className="w-10 h-10 rounded-lg object-cover group-hover:scale-105 transition-transform border border-purple-500/20"
                                />
                                <span className="text-xs font-medium text-purple-200 group-hover:text-purple-100 truncate">{preset.name}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                {/* ═══════════════════════════════════════
                    AUTH SECTION
                ═══════════════════════════════════════ */}
                <div id="auth" className="scroll-mt-24">
                  {renderGoogleFirebase()}
                </div>

                {/* ═══════════════════════════════════════
                    USERS SECTION
                ═══════════════════════════════════════ */}
                <div id="users" className="scroll-mt-24">
                  <AdminControls
                    user={user}
                    users={users}
                    username={username}
                    setUsername={setUsername}
                    password={password}
                    setPassword={setPassword}
                    role={role}
                    setRole={setRole}
                    isCreatingUser={isCreatingUser}
                    createUser={createUser}
                    editingUserId={editingUserId}
                    setEditingUserId={setEditingUserId}
                    adminUserNewPassword={adminUserNewPassword}
                    setAdminUserNewPassword={setAdminUserNewPassword}
                    changeUserPassword={changeUserPassword}
                    deleteUser={deleteUser}
                    changeUserRole={changeUserRole}
                  />
                </div>

                {/* ═══════════════════════════════════════
                    SYSTEM SECTION — LOCKED (Coming Soon)
                ═══════════════════════════════════════ */}
                <section id="system" className="scroll-mt-24 aw-glass p-6 md:p-8">
                  <div className="flex items-center justify-between mb-4 relative z-10 flex-wrap gap-3">
                    <h2 className="text-xl font-bold flex items-center text-purple-200">
                      <RefreshCw className="mr-3 text-purple-400 w-5 h-5" /> System Update
                    </h2>
                    <span
                      className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[10px] font-mono font-medium uppercase"
                      style={{
                        background: 'rgba(245,158,11,.12)',
                        color: '#fbbf24',
                        border: '1px solid rgba(245,158,11,.35)',
                      }}
                    >
                      <Lock className="w-3 h-3" /> Coming Soon
                    </span>
                  </div>
                  <div className="relative z-10">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
                      <div className="p-3 rounded-xl bg-black/40 border border-purple-500/20">
                        <div className="text-[10px] uppercase font-mono tracking-wider text-zinc-500">Version</div>
                        <div className="text-sm font-bold font-mono text-purple-400 mt-0.5">v1.80</div>
                      </div>
                      <div className="p-3 rounded-xl bg-black/40 border border-amber-500/25">
                        <div className="text-[10px] uppercase font-mono tracking-wider text-zinc-500">Status</div>
                        <div className="text-sm font-bold font-mono mt-0.5" style={{ color: '#fbbf24' }}>Locked</div>
                      </div>
                      <div className="p-3 rounded-xl bg-black/40 border border-purple-500/20">
                        <div className="text-[10px] uppercase font-mono tracking-wider text-zinc-500">Main Port</div>
                        <div className="text-sm font-bold font-mono text-purple-400 mt-0.5">6767</div>
                      </div>
                      <div className="p-3 rounded-xl bg-black/40 border border-purple-500/20">
                        <div className="text-[10px] uppercase font-mono tracking-wider text-zinc-500">Default Driver</div>
                        <div className="text-sm font-bold font-mono text-purple-400 mt-0.5 capitalize">{defaultRuntime || "Docker"}</div>
                      </div>
                    </div>

                    {/* Info banner — why locked */}
                    <div className="aw-coming-soon mb-5 p-4 flex items-start gap-3">
                      <Lock className="w-4 h-4 shrink-0 mt-0.5" style={{ color: '#fbbf24' }} />
                      <div className="text-xs leading-relaxed" style={{ color: 'rgba(252,211,77,.85)' }}>
                        <p className="font-bold text-sm mb-1.5" style={{ color: '#fcd34d' }}>
                          System Update is Temporarily Locked
                        </p>
                        <p className="mb-2">
                          We're building a <strong>safer GitHub-based update system</strong>. The old update mechanism replaced panel files directly, which could overwrite your customizations.
                        </p>
                        <p className="font-semibold mb-1" style={{ color: '#fbbf24' }}>
                          🚀 Coming in V1.81 — New Update System will:
                        </p>
                        <ul className="list-disc list-inside space-y-0.5" style={{ color: 'rgba(252,211,77,.75)' }}>
                          <li>Compare your panel files with the official GitHub release</li>
                          <li>Show exactly which files will be updated</li>
                          <li>Only modify safe, non-customized files</li>
                          <li>Preserve your logos, wallpapers, and customizations</li>
                          <li>Display version diff before applying</li>
                        </ul>
                      </div>
                    </div>

                    <p className="text-zinc-400 text-sm mb-6 max-w-2xl">
                      For now, <strong className="text-purple-400">AstroWax Panel v1.80</strong> is running the latest available version. Updates will be re-enabled once the new GitHub-based safe update system is deployed.
                    </p>

                    <button
                      onClick={handleSystemUpdate}
                      disabled
                      className="px-6 py-2.5 rounded-xl font-medium flex items-center cursor-not-allowed opacity-60"
                      style={{
                        background: 'rgba(0,0,0,.4)',
                        border: '1px solid rgba(245,158,11,.3)',
                        color: '#fbbf24',
                      }}
                    >
                      <Lock className="w-4 h-4 mr-2" />
                      Update Locked — Coming Soon
                    </button>
                  </div>
                </section>

              </div>
            </div>
          </main>
        </div>

        {selectedImage && (
          <ImageCropper
            imageSrc={selectedImage}
            onCropComplete={handleCropComplete}
            onCancel={() => { setSelectedImage(null); setCroppingType(null); }}
            aspectRatio={croppingType === "background" ? bgAspectRatio : 1}
            title={croppingType === "background" ? "Crop Background" : "Crop Logo"}
          />
        )}

        {(isProcessing || isUpdatingLogo || isSavingSettings || isCreatingUser || isUpdatingSystem) && <LoadingOverlay />}
      </div>
    </>
  );
}