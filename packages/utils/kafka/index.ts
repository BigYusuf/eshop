import { Kafka } from "kafkajs";

const kafka = new Kafka({
  clientId: "kafka-service",
  brokers: ["pkc-619z3.us-east1.gcp.confluent.cloud:9092"],
  ssl: true,
  sasl: {
    mechanism: "plain",
    username: "PQGSDMMVQMOQNA7V",
    password:
      "cflt1z/tCFKvWwaBMRBl0GX1N36OBbUaS47u/lq9fR8Gu9c8dhnXMqJ1WoEchgDg",
  },
  connectionTimeout: 10000, // 10s
  requestTimeout: 30000, // 30s
});

export const producer = kafka.producer();

export async function initProducer() {
  await producer.connect();
  console.log("✅ Kafka Producer connected");
}

export async function shutdownProducer() {
  await producer.disconnect();
  console.log("❌ Kafka Producer disconnected");
}
export const consumer = (groupId: string) => kafka.consumer({ groupId });
