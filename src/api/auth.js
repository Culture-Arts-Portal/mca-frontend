import client from "./client";

// All login-related calls live here, matching Person 2's endpoints.

export async function registerUser(details) {
  // details = { name, email, password, phone? }
  const res = await client.post("/auth/register", details);
  return res.data; // -> { token, user }
}

export async function loginUser(email, password) {
  const res = await client.post("/auth/login", { email, password });
  return res.data; // -> { token, user }
}

export async function getCurrentUser() {
  const res = await client.get("/auth/me");
  return res.data.user; // /auth/me answers { user }, like register and login
}