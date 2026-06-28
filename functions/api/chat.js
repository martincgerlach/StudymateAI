import { createOptionsResponse, handleChatRequest } from "../../cloudflare/studymate-api.js";

export function onRequestOptions({ request, env }) {
  return createOptionsResponse(request, env);
}

export async function onRequestPost({ request, env }) {
  return handleChatRequest(request, env);
}
