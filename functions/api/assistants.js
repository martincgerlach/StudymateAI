import { getPublicAssistants, jsonResponse } from "../../cloudflare/studymate-api.js";

export function onRequestGet({ request, env }) {
  return jsonResponse(
    {
      assistants: getPublicAssistants(),
    },
    request,
    env
  );
}
