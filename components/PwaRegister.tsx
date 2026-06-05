"use client";

import { useEffect } from "react";

export function PwaRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    const isLocalhost = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
    if (window.location.protocol !== "https:" && !isLocalhost) return;

    const registerServiceWorker = async () => {
      try {
        await navigator.serviceWorker.register("/sw.js", { scope: "/" });
      } catch (error) {
        if (process.env.NODE_ENV !== "production") {
          console.warn("Service worker registration failed", error);
        }
      }
    };

    void registerServiceWorker();
  }, []);

  return null;
}
