import { runChatDiet } from "./run-chat-diet.js";

export default async function handler(req, res) {
  await runChatDiet(req, res);
}
