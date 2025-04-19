// App.jsx
import React, { useEffect, useState } from "react";
import { Route, Routes, Navigate, useNavigate } from "react-router-dom";
import Home        from "./pages/Home";
import Collection  from "./pages/Collection";
import About       from "./pages/About";
import Contact     from "./pages/Contact";
import Product     from "./pages/Product";
import Cart        from "./pages/Cart";
import Login       from "./pages/Login";
import PlaceOrder  from "./pages/PlaceOrder";
import Orders      from "./pages/Orders";
import Navbar      from "./components/Navbar";
import Footer      from "./components/Footer";
import AnnouncementBar from "./components/AnnouncementBar";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { MutatingDots } from "react-loader-spinner";

export const backendUrl = "https://api.qualityclothings.com";
export const currency   = "₹ ";

const App = () => {
  const [showAnimation, setShowAnimation] = useState(true);
  const navigate = useNavigate();

  // 1) scroll & loader
  useEffect(() => {
    window.scrollTo(0, 0);
    const t = setTimeout(() => setShowAnimation(false), 1500);
    return () => clearTimeout(t);
  }, []);

  // 2) first‑time visitor redirect
  useEffect(() => {
    const hasVisited = localStorage.getItem("hasVisited");
    if (!hasVisited) {
      localStorage.setItem("hasVisited", "true");
      // replace so back‑button doesn’t send them back to “we just redirected”
      navigate("/collection", { replace: true });
    }
  }, [navigate]);

  return (
    <>
      <ToastContainer />
      <AnnouncementBar />

      {showAnimation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white">
          <MutatingDots
            height={120}
            width={120}
            color="#32cd32"
            secondaryColor="#2ecc71"
            radius={12.5}
            ariaLabel="mutating-dots-loading"
            visible
          />
        </div>
      )}

      <div className="px-4 sm:px-[5vw] md:px-[7vw] lg:px-[9vw] relative">
        <Navbar />

        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Home />} />
          <Route path="/collection" element={<Collection />} />
          <Route path="/about"   element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/product/:productId" element={<Product />} />
          <Route path="/cart"        element={<Cart />} />
          <Route path="/place-order" element={<PlaceOrder />} />
          <Route path="/orders"      element={<Orders />} />
          <Route path="*"            element={<Navigate to="/" />} />
        </Routes>

        <Footer />
      </div>
    </>
  );
};

export default App;
