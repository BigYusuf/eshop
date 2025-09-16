// user-ui/src/utils/track-client.ts
export async function sendEventFromClient(eventData: any) {
  try {
    const res = await fetch("/api/track-user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(eventData),
    });

    const data = await res.json();
    console.log("📩 API response:", res.status, data);

    return data;
  } catch (err) {
    console.error("❌ Client -> API event error:", err);
    return { success: false, error: err };
  }
}
