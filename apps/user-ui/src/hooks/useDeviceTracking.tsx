"use client";

import { useEffect, useState } from "react";
import { UAParser } from "ua-parser-js";

const DEVICE_STORAGE_KEY = "user_device";
const TRACKING_INTERVAL = 15 * 60 * 1000; // 15 minutes
const DEVICE_EXPIRY_DAYS = 20; // 20 days

// Helper: safely access localStorage
const safeLocalStorage = {
  getItem: (key: string) => {
    if (typeof window === "undefined") return null;
    try {
      return window.localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  setItem: (key: string, value: string) => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(key, value);
    } catch {}
  },
  removeItem: (key: string) => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.removeItem(key);
    } catch {}
  },
};

// Helper: get stored device info if not expired
const getStoredDeviceInfo = () => {
  const stored = safeLocalStorage.getItem(DEVICE_STORAGE_KEY);
  if (!stored) return null;
  try {
    const parsed = JSON.parse(stored);
    const expiryTime = DEVICE_EXPIRY_DAYS * 24 * 60 * 60 * 1000;
    const isExpired =
      Date.now() - new Date(parsed.timestamp).getTime() > expiryTime;
    if (isExpired) {
      safeLocalStorage.removeItem(DEVICE_STORAGE_KEY);
      return null;
    }
    return parsed;
  } catch {
    safeLocalStorage.removeItem(DEVICE_STORAGE_KEY);
    return null;
  }
};

// Store with timestamp
const storeDeviceInfo = (data: any) => {
  const stored = {
    ...data,
    timestamp: new Date().toISOString(),
  };
  safeLocalStorage.setItem(DEVICE_STORAGE_KEY, JSON.stringify(stored));
};

const useDeviceTracking = () => {
  const [deviceInfo, setDeviceInfo] = useState<any>(null);

  useEffect(() => {
    // Try restoring from storage only in browser
    const stored = getStoredDeviceInfo();
    if (stored) {
      setDeviceInfo(stored);
      return;
    }

    const fetchDeviceInfo = () => {
      const parser = new UAParser();
      const result = parser.getResult();

      const info = {
        browser: `${result.browser.name ?? "Unknown"} ${
          result.browser.version ?? ""
        }`,
        os: `${result.os.name ?? "Unknown"} ${result.os.version ?? ""}`,
        device: result.device.type || "desktop",
      };

      setDeviceInfo(info);
      storeDeviceInfo(info);
    };

    fetchDeviceInfo();
    const interval = setInterval(fetchDeviceInfo, TRACKING_INTERVAL);
    return () => clearInterval(interval);
  }, []);

  return deviceInfo;
};

export default useDeviceTracking;
