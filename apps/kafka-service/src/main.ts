// consumer.ts
import { consumer, initProducer, shutdownProducer } from "@packages/utils/kafka";
import { updateUserAnalytics } from "./services/analytics.service";

const consumer1 = consumer("user_events-group"); // unique group id
const eventsQueue: any[] = [];

// process queue every 3 seconds
async function processQueue() {
  if (eventsQueue.length === 0) return;

  const events = [...eventsQueue];
  eventsQueue.length = 0;

  for (const event of events) {
    if (event.action === "shop_visit") {
      // TODO: update shop analytics
    }

    const validActions = [
      "add_to_wishlist",
      "add_to_cart",
      "product_view",
      "purchase",
      "remove_from_wishlist",
      "remove_from_cart",
    ];

    if (!event.action || !validActions.includes(event.action)) {
      continue;
    }

    try {
      console.log("📥 Processing event:", event);
      await updateUserAnalytics(event);
    } catch (error) {
      console.error("❌ Error processing event:", error);
    }
  }
}

setInterval(processQueue, 3000);

export const consumeKafkaMessages = async () => {
  await consumer1.connect();
  await consumer1.subscribe({ topic: "user_events", fromBeginning: false });

  await consumer1.run({
    eachMessage: async ({ message }) => {
      if (!message.value) return;
      const event = JSON.parse(message.value.toString());
      eventsQueue.push(event);
    },
  });
};

// bootstrap the consumer + producer
(async () => {
  try {
    console.log("object")
    await initProducer();         // ✅ connect producer (for emitting if needed)
    await consumeKafkaMessages(); // ✅ start consuming

    // Graceful shutdown
    const shutdown = async () => {
      console.log("🛑 Shutting down consumer...");
      await consumer1.disconnect();
      await shutdownProducer();
      process.exit(0);
    };

    process.on("SIGINT", shutdown);
    process.on("SIGTERM", shutdown);
  } catch (err) {
    console.error("❌ Consumer startup failed:", err);
    process.exit(1);
  }
})();
