import { Routes, Route } from "react-router-dom";
import Layout from "../components/layout/Layout";
import ProtectedRoute from "./ProtectedRoute";
import Home from "../pages/public/Home";
import Services from "../pages/public/Services";
import Login from "../pages/public/Login";
import Register from "../pages/public/Register";
import NotFound from "../pages/public/NotFound";
import MyApplications from "../pages/citizen/MyApplications";
import ServiceDetails from "../pages/public/ServiceDetails";
import Apply from "../pages/citizen/Apply";
export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<Layout />}>
        {/* Anyone can see these */}
        <Route path="/" element={<Home />} />
        <Route path="/services" element={<Services />} />
        <Route path="/services/:slug" element={<ServiceDetails />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Logged-in users only */}
        <Route element={<ProtectedRoute />}>
          <Route path="/my-applications" element={<MyApplications />} />
          <Route path="/apply/:slug" element={<Apply />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}