import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import { AuthProvider } from "./context/AuthContext";
import { Toaster } from "react-hot-toast";

const root = createRoot(document.getElementById("root"));
root.render(
  <AuthProvider>
    <Toaster />
    <App />
  </AuthProvider>
);
