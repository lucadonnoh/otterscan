import "@fontsource/fira-code/index.css";
import "@fontsource/roboto-mono/index.css";
import "@fontsource/roboto/index.css";
import "@fontsource/space-grotesk/index.css";
import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import reportWebVitals from "./reportWebVitals";

const storedTheme = localStorage.getItem("theme");
const useDarkTheme =
  storedTheme === "dark" ||
  (storedTheme === null &&
    window.matchMedia("(prefers-color-scheme: dark)").matches);
document.documentElement.classList.toggle("dark", useDarkTheme);

const container = document.getElementById("root");
const root = createRoot(container!);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
