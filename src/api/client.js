import axios from "axios";

// One shared Axios instance for the whole app.
// The base URL comes from .env so nobody hard-codes localhost in components.
const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 10000,
});

// Before every request: attach the login token if the user is logged in.
// (Person 2's login endpoint will give us this token from Week 2.)
client.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// After every response: unwrap the backend's { success, data, message } format
// and turn errors into one readable message.
client.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message =
      error.response?.data?.message ||
      (error.request
        ? "Can't reach the server. Is the backend running on port 5000?"
        : error.message);
        const err = new Error(message);
    err.status = error.response?.status; // e.g. 404, or undefined if the server was unreachable
    return Promise.reject(err);
  }
);

export default client;