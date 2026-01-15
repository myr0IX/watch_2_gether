"use server";

import { Mistral } from "@mistralai/mistralai";

const apiKey = process.env.MISTRAL_API_KEY;

if (!apiKey) {
  throw new Error("MISTRAL_API_KEY environment variable is not set");
}

export async function getAIClient() {
  return new Mistral({
    apiKey: apiKey,
    userAgent: "watch_2_gether",
  });
}
