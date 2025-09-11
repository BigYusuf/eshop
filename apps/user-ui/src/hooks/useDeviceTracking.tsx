"use client";

import { useEffect, useState } from "react";
import { UAParser } from "ua-parser-js";

const DEVICE_STORAGE_KEY = "user_device";
const TRACKING_INTERVAL = 15 * 60 * 1000; // 15 minutes
const DEVICE_EXPIRY_DAYS = 20; // 20 days

// Helper: get stored device info if not expired
const getStoredDeviceInfo = () => {
  const stored = localStorage.getItem(DEVICE_STORAGE_KEY);
  if (!stored) return null;
  try {
    const parsed = JSON.parse(stored);
    const expiryTime = DEVICE_EXPIRY_DAYS * 24 * 60 * 60 * 1000;
    const isExpired =
      new Date().getTime() - new Date(parsed.timestamp).getTime() > expiryTime;
    if (isExpired) {
      localStorage.removeItem(DEVICE_STORAGE_KEY);
      return null;
    }
    return parsed;
  } catch {
    localStorage.removeItem(DEVICE_STORAGE_KEY);
    return null;
  }
};

// Store with timestamp
const storeDeviceInfo = (data: any) => {
  const stored = {
    ...data,
    timestamp: new Date().toISOString(),
  };
  localStorage.setItem(DEVICE_STORAGE_KEY, JSON.stringify(stored));
};

const useDeviceTracking = () => {
  const [deviceInfo, setDeviceInfo] = useState<any>(getStoredDeviceInfo());

  useEffect(() => {
    if (deviceInfo) return; // Already have device info

    const fetchDeviceInfo = () => {
      const parser = new UAParser();
      const result = parser.getResult();

      const info = {
        browser: `${result.browser.name} ${result.browser.version}`,
        os: `${result.os.name} ${result.os.version}`,
        device: result.device.type || "desktop",
      };

      setDeviceInfo(info);
      storeDeviceInfo(info);
    };

    fetchDeviceInfo();
    const interval = setInterval(fetchDeviceInfo, TRACKING_INTERVAL);
    return () => clearInterval(interval);
  }, [deviceInfo]);

  return deviceInfo
    ? `${deviceInfo.device} | ${deviceInfo.browser} | ${deviceInfo.os}`
    : null;
};

export default useDeviceTracking;
