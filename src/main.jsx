import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import App from "./App";
import { ThemeProvider } from "./contexts/ThemeContext";

import { AuthProvider } from "./contexts/AuthContext";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider>

        <AuthProvider>
          <App />
          <ToastContainer theme="light" />
        </AuthProvider>
      </ThemeProvider>

    </BrowserRouter>
  </React.StrictMode>
);
