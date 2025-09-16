"use client";

import { useEffect, useState } from "react";

const LOCATION_STORAGE_KEY = "user_location";
const TRACKING_INTERVAL = 15 * 60 * 1000; // 15 minutes
const LOCATION_EXPIRY_DAYS = 20; // 20 days

// Helper: get stored location if not expired
const getStoredLocation = () => {
  if (typeof window === "undefined") return null; // ✅ SSR safe

  const stored = localStorage.getItem(LOCATION_STORAGE_KEY);
  if (!stored) return null;
  try {
    const parsed = JSON.parse(stored);
    const expiryTime = LOCATION_EXPIRY_DAYS * 24 * 60 * 60 * 1000;
    const isExpired =
      new Date().getTime() - new Date(parsed.timestamp).getTime() > expiryTime;
    if (isExpired) {
      localStorage.removeItem(LOCATION_STORAGE_KEY);
      return null;
    }
    return parsed;
  } catch {
    localStorage.removeItem(LOCATION_STORAGE_KEY);
    return null;
  }
};

// Store with timestamp
const storeLocation = (data: {
  city?: string;
  country?: string;
  lat?: number;
  lon?: number;
  query?: string; // user ip
}) => {
  if (typeof window === "undefined") return; // ✅ SSR safe
  const stored = {
    ...data,
    timestamp: new Date().toISOString(),
  };
  localStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(stored));
};

const useLocationTracking = () => {
  const [location, setLocation] = useState<{
    city?: string;
    country?: string;
    lat?: number;
    lon?: number;
    ip?: string;
  } | null>(null);

  // ✅ Only run on client
  useEffect(() => {
    const storedLocation = getStoredLocation();
    if (storedLocation) {
      setLocation(storedLocation);
      return;
    }

    const fetchLocation = async () => {
      try {
        const res = await fetch("http://ip-api.com/json"); // free endpoint
        const data = await res.json();
        const locationData = {
          city: data.city,
          country: data.country,
          lat: data.lat,
          lon: data.lon,
          ip: data.query,
        };
        console.log("locationData:", locationData);
        storeLocation(locationData);
        setLocation(locationData);
      } catch (err) {
        console.error("IP-API location fetch failed:", err);
      }
    };

    fetchLocation();
    const interval = setInterval(fetchLocation, TRACKING_INTERVAL);
    return () => clearInterval(interval);
  }, []);

  return location;
};

export default useLocationTracking;
