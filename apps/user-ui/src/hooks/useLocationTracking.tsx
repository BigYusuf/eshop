"use client";

import { useEffect, useState } from "react";

const LOCATION_STORAGE_KEY = "user_location";
const TRACKING_INTERVAL = 15 * 60 * 1000; // 15 minutes
const LOCATION_EXPIRY_DAYS = 20; // 20 days

// Helper: get stored location if not expired
const getStoredLocation = () => {
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
  latitude: number;
  longitude: number;
  accuracy: number;
  city?: string;
  country?: string;
}) => {
  const stored = {
    ...data,
    timestamp: new Date().toISOString(),
  };
  localStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(stored));
};

// Reverse geocode with multiple providers
const reverseGeocode = async (
  lat: number,
  lon: number
): Promise<{ city?: string; country?: string }> => {
  const provider = process.env.NEXT_PUBLIC_GEO_PROVIDER || "nominatim";

  try {
    if (provider === "nominatim") {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`
      );
      const data = await res.json();
      return {
        city: data.address.city || data.address.town || data.address.village,
        country: data.address.country,
      };
    }

    if (provider === "bigdatacloud") {
      const res = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`
      );
      const data = await res.json();
      return {
        city: data.city || data.locality,
        country: data.countryName,
      };
    }

    // Add Google Maps example (needs API key)
    if (provider === "google") {
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY;
      const res = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lon}&key=${apiKey}`
      );
      const data = await res.json();
      const address = data.results[0]?.address_components || [];
      const cityObj = address.find((a: any) =>
        a.types.includes("locality")
      );
      const countryObj = address.find((a: any) =>
        a.types.includes("country")
      );
      return {
        city: cityObj?.long_name,
        country: countryObj?.long_name,
      };
    }

    return {};
  } catch (err) {
    console.error("Reverse geocoding failed:", err);
    return {};
  }
};

const useLocationTracking = () => {
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
    accuracy: number;
    city?: string;
    country?: string;
  } | null>(getStoredLocation());

  useEffect(() => {
    const storedLocation = getStoredLocation();
    if (storedLocation) return;

    const fetchLocation = () => {
      if (!navigator.geolocation) {
        console.warn("Geolocation is not supported by this browser.");
        return;
      }
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude, accuracy } = position.coords;

          const { city, country } = await reverseGeocode(latitude, longitude);

          const locationData = { latitude, longitude, accuracy, city, country };
          storeLocation(locationData);
          setLocation(locationData);
        },
        (error) => {
          console.error("Error getting location:", error);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    };

    fetchLocation();
    const interval = setInterval(fetchLocation, TRACKING_INTERVAL);
    return () => clearInterval(interval);
  }, []);

  return location;
};

export default useLocationTracking;
