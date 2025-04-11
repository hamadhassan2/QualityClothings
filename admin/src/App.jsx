import React, { useEffect, useState } from "react";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import { Route, Routes } from "react-router-dom";
import Add from "./pages/Add";
import List from "./pages/List";
import Orders from "./pages/Orders";
import Login from "./components/Login";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export const backendUrl = import.meta.env.VITE_BACKEND_URL;
export const currency = "₹";

const App = () => {
  const [token, setToken] = useState(localStorage.getItem('token') || '');

  useEffect(() => {
    localStorage.setItem("token", token);
  }, [token]);

  return (
    <div className=" min-h-screen">
      <ToastContainer />
      {token === "" ? (
        <Login setToken={setToken} />
      ) : (
        <>
          {/* Fixed Navbar */}
          <div className="fixed top-0 w-full z-50 bg-white shadow-md">
            <Navbar setToken={setToken} />
          </div>
          <div className="flex pt-16">
            {/* Fixed Sidebar */}
            <div className="fixed left-0 top-16 h-[calc(100vh-64px)] w-[18%] bg-white shadow-md border-r-2 overflow-y-auto">
              <Sidebar />
            </div>
            {/* Scrollable Content */}
            <div className="flex-1 ml-[18%] p-0 md:p-8 overflow-auto h-[calc(100vh-64px)] text-gray-600 text-base">
              <Routes>
                <Route path="/add" element={<Add token={token} />} />
                <Route path="/list" element={<List token={token} />} />
                <Route path="/orders" element={<Orders token={token} />} />
              </Routes>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default App;
