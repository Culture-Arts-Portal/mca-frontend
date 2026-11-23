import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";

// Every page renders inside <Outlet />, between the Navbar and Footer.
export default function Layout() {
  return (
    <div className="layout">
      <Navbar />
      <main className="container main">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}