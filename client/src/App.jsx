import React from "react";
import { BrowserRouter } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AppRoutes } from "./routes/AppRoutes";
import { AuthProvider } from "./context/AuthContext";

import { ToastProvider } from "./components/ui/Toast";

import { HelmetProvider } from "react-helmet-async";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <HelmetProvider>
          <ToastProvider>
            <AppRoutes />
            <ToastContainer />
          </ToastProvider>
        </HelmetProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
