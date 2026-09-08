"use client";

import { useEffect } from "react";

export function RegisterSW() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // Registrierung fehlgeschlagen (z. B. lokal ohne HTTPS) — kein Problem,
        // die App funktioniert auch ohne Service Worker ganz normal.
      });
    }
  }, []);

  return null;
}
