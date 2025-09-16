"use server";

import { producer, initProducer } from "packages/utils/kafka";

let producerReady = false;

async function ensureProducer() {
  if (!producerReady) {
    await initProducer();
    producerReady = true;
    console.log("✅ Kafka producer ready in user-ui");
  }
}

export const sendKafkaEvent = async (eventData: any) => {
  try {
    console.log("test")
    await ensureProducer();
    console.log("📤 Sending event:", eventData);

    await producer.send({
      topic: "user_events",
      messages: [{ value: JSON.stringify(eventData) }],
    });
  } catch (error) {
    console.error("Kafka send error:", error);
  }
};
