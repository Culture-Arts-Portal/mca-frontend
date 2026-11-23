import client from "./client";

// All calls related to services live here, so pages never build URLs themselves.
export async function getServices() {
  const res = await client.get("/services"); // -> { success, data, message }
  return res.data;
}

export async function getServiceBySlug(slug) {
  const res = await client.get(`/services/${slug}`);
  return res.data;
}