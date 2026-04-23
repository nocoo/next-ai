import { generateCssVariables } from "@nocoo/next-ai/react";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

const styleEl = document.createElement("style");
styleEl.textContent = `
:root { ${generateCssVariables("light")} }
.dark { ${generateCssVariables("dark")} }
`;
document.head.appendChild(styleEl);

const root = document.getElementById("root");
if (!root) throw new Error("#root not found");

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
