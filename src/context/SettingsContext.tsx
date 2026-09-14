import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

// ============================================
// AstroWax Panel V1.80 — Settings Context
// ============================================

interface SettingsContextValue {
  panelName: string;
  panelLogo: string;
  panelBackgroundImage: string;
  panelBackgroundBlur: number;
  enablePlayit: boolean;
  enableTutorial: boolean;
  enableLoginAnimation: boolean;
  enableRegistration: boolean;
  theme: string;
  setTheme: (theme: string) => void;
  enableGoogleLogin: boolean;
  firebaseApiKey: string;
  firebaseAuthDomain: string;
  firebaseProjectId: string;
  firebaseStorageBucket: string;
  firebaseMessagingSenderId: string;
  firebaseAppId: string;
  defaultRuntime: string;
  setDefaultRuntime: (runtime: string) => void;
  isDevPanel: boolean;
  fetchSettings: () => Promise<void>;
}

export const SettingsContext = createContext<SettingsContextValue>(null as any);

export const SettingsProvider = ({ children }: { children: React.ReactNode }) => {
  const [panelName, setPanelName] = useState<string>("AstroWax Panel");
  const [panelLogo, setPanelLogo] = useState<string>("");
  const [panelBackgroundImage, setPanelBackgroundImage] = useState<string>("");
  const [panelBackgroundBlur, setPanelBackgroundBlur] = useState<number>(10);
  const [enablePlayit, setEnablePlayit] = useState<boolean>(false);
  const [enableTutorial, setEnableTutorial] = useState<boolean>(true);
  const [enableLoginAnimation, setEnableLoginAnimation] = useState<boolean>(true);
  const [enableRegistration, setEnableRegistration] = useState<boolean>(true);
  const [theme, setThemeState] = useState<string>("purple");
  const [enableGoogleLogin, setEnableGoogleLogin] = useState<boolean>(false);
  const [firebaseApiKey, setFirebaseApiKey] = useState<string>("");
  const [firebaseAuthDomain, setFirebaseAuthDomain] = useState<string>("");
  const [firebaseProjectId, setFirebaseProjectId] = useState<string>("");
  const [firebaseStorageBucket, setFirebaseStorageBucket] = useState<string>("");
  const [firebaseMessagingSenderId, setFirebaseMessagingSenderId] = useState<string>("");
  const [firebaseAppId, setFirebaseAppId] = useState<string>("");
  const [defaultRuntime, setDefaultRuntimeState] = useState<string>("docker");
  const [isDevPanel, setIsDevPanel] = useState<boolean>(false);

  // ═══════════════════════════════════════════
  // 🎨 Apply theme to <html> element
  // ═══════════════════════════════════════════
  useEffect(() => {
    const applyTheme = (t: string) => {
      const validThemes = ["purple", "blue", "emerald", "orange", "rose"];
      const finalTheme = validThemes.includes(t) ? t : "purple";
      document.documentElement.setAttribute("data-theme", finalTheme);
      console.log(`🎨 Theme applied: ${finalTheme}`);
    };
    applyTheme(theme);
  }, [theme]);

  // ═══════════════════════════════════════════
  // setTheme — update state + backend
  // ═══════════════════════════════════════════
  const setTheme = async (newTheme: string) => {
    const validThemes = ["purple", "blue", "emerald", "orange", "rose"];
    const finalTheme = validThemes.includes(newTheme) ? newTheme : "purple";

    // 1. Update local state (instant)
    setThemeState(finalTheme);
    document.documentElement.setAttribute("data-theme", finalTheme);

    // 2. Save to backend
    try {
      await axios.put("/api/system/settings", { theme: finalTheme });
      console.log(`✅ Theme saved to backend: ${finalTheme}`);
    } catch (err) {
      console.error("❌ Failed to save theme:", err);
    }
  };

  const setDefaultRuntime = async (runtime: string) => {
    setDefaultRuntimeState(runtime);
  };

  // ═══════════════════════════════════════════
  // fetchSettings — load from backend
  // ═══════════════════════════════════════════
  const fetchSettings = async () => {
    try {
      const res = await axios.get("/api/system/settings");
      const s = res.data;

      if (s.panelName !== undefined) setPanelName(s.panelName);
      if (s.panelLogo !== undefined) setPanelLogo(s.panelLogo);
      if (s.panelBackgroundImage !== undefined) setPanelBackgroundImage(s.panelBackgroundImage);
      if (s.panelBackgroundBlur !== undefined) setPanelBackgroundBlur(s.panelBackgroundBlur);
      if (s.enablePlayit !== undefined) setEnablePlayit(s.enablePlayit);
      if (s.enableTutorial !== undefined) setEnableTutorial(s.enableTutorial);
      if (s.enableLoginAnimation !== undefined) setEnableLoginAnimation(s.enableLoginAnimation);
      if (s.enableRegistration !== undefined) setEnableRegistration(s.enableRegistration);

      if (s.theme !== undefined) {
        setThemeState(s.theme);
        document.documentElement.setAttribute("data-theme", s.theme);
      }

      if (s.enableGoogleLogin !== undefined) setEnableGoogleLogin(s.enableGoogleLogin);
      if (s.firebaseApiKey !== undefined) setFirebaseApiKey(s.firebaseApiKey);
      if (s.firebaseAuthDomain !== undefined) setFirebaseAuthDomain(s.firebaseAuthDomain);
      if (s.firebaseProjectId !== undefined) setFirebaseProjectId(s.firebaseProjectId);
      if (s.firebaseStorageBucket !== undefined) setFirebaseStorageBucket(s.firebaseStorageBucket);
      if (s.firebaseMessagingSenderId !== undefined) setFirebaseMessagingSenderId(s.firebaseMessagingSenderId);
      if (s.firebaseAppId !== undefined) setFirebaseAppId(s.firebaseAppId);
      if (s.defaultRuntime !== undefined) setDefaultRuntimeState(s.defaultRuntime);
      if (s.isDevPanel !== undefined) setIsDevPanel(s.isDevPanel);
    } catch (e) {
      console.error("Failed to fetch settings:", e);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return (
    <SettingsContext.Provider
      value={{
        panelName,
        panelLogo,
        panelBackgroundImage,
        panelBackgroundBlur,
        enablePlayit,
        enableTutorial,
        enableLoginAnimation,
        enableRegistration,
        theme,
        setTheme,
        enableGoogleLogin,
        firebaseApiKey,
        firebaseAuthDomain,
        firebaseProjectId,
        firebaseStorageBucket,
        firebaseMessagingSenderId,
        firebaseAppId,
        defaultRuntime,
        setDefaultRuntime,
        isDevPanel,
        fetchSettings,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext);