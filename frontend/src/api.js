import { supabase } from "./supabaseClient";

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

async function getToken() {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token;
}

export async function apiGet(path) {
  const token = await getToken();
  const res = await fetch(`${API_URL}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
}

export async function apiPost(path, body) {
  const token = await getToken();
  const res = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });
  return res.json();
}

export async function apiPatch(path, body) {
  const token = await getToken();
  const res = await fetch(`${API_URL}${path}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });
  return res.json();
}

export async function apiDelete(path) {
  const token = await getToken();
  const res = await fetch(`${API_URL}${path}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
}

export async function askAI(message) {
  return apiPost("/ai/agent", { message });
}