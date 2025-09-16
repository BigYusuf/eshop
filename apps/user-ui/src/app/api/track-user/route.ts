// user-ui/src/app/api/track-user/route.ts
import { sendKafkaEvent } from "apps/user-ui/src/actions/track-user";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const eventData = await req.json();
    console.log("📥 Received event from client:", eventData);

    await sendKafkaEvent(eventData);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("❌ API -> Kafka error:", err);
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}
