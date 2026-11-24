import client from "./client";

// All login-related calls live here, matching Person 2's endpoints.

export async function registerUser(details) {
  // details = { fullName, nrc, email, phone, password }
  const res = await client.post("/auth/register", details);
  return res.data; // -> { token, user }
}

export async function loginUser(email, password) {
  const res = await client.post("/auth/login", { email, password });
  return res.data; // -> { token, user }
}

export async function getCurrentUser() {
  const res = await client.get("/auth/me");
  return res.data; // -> user
}