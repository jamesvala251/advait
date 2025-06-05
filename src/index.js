import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import * as serviceWorker from "./serviceWorker";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Register service worker with specific configuration
serviceWorker.register({
  onSuccess: (registration) => {
    console.log('Service Worker registered successfully');
  },
  onUpdate: (registration) => {
    console.log('New content is available; please refresh.');
  }
}); 