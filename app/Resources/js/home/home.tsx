import React from "react";
import ReactDOM from "react-dom/client";
import { AlertDemo } from "./AlertDemo";

function renderAlertToWrapper() {
  const divWrapper = document.querySelector("#test");

  if (divWrapper) {
    const root = ReactDOM.createRoot(divWrapper);
    root.render(
      <React.StrictMode>
        <AlertDemo />
      </React.StrictMode>
    );
  } else {
    console.error("Element with ID 'test' not found.");
  }
}

renderAlertToWrapper();
