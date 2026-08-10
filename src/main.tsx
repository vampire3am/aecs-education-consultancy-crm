import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./app/App";
import "./styles/globals.css";
import "./styles/features.css";
import "./styles/modal.css";
import "./styles/phase9.css";
import "./styles/public-registration.css";
import "./styles/public-registration-validation.css";
import "./styles/final-polish.css";
import "./styles/topbar-interactions.css";
import "./styles/mobile-hardening.css";
import "./styles/brand-redesign.css";
import "./styles/date-filters.css";
import { ErrorBoundary } from "./core/error/ErrorBoundary";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ErrorBoundary><BrowserRouter><App /></BrowserRouter></ErrorBoundary>
  </React.StrictMode>,
);
