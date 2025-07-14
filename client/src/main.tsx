import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Suppress Vite HMR WebSocket connection errors in Replit deployments
const originalConsoleError = console.error;
console.error = (...args) => {
  const message = args.join(' ');
  // Filter out common Vite HMR WebSocket errors that are expected in Replit deployments
  if (
    message.includes('WebSocket connection') ||
    message.includes('NS_ERROR_WEBSOCKET_CONNECTION_REFUSED') ||
    message.includes('setupWebSocket') ||
    message.includes('fallback') ||
    (message.includes('DOMException') && message.includes('invalid or illegal string'))
  ) {
    return; // Suppress these expected errors
  }
  originalConsoleError.apply(console, args);
};

// Handle unhandled promise rejections related to WebSocket
window.addEventListener('unhandledrejection', (event) => {
  if (event.reason && event.reason.toString().includes('WebSocket')) {
    event.preventDefault(); // Prevent the error from showing in console
  }
});

createRoot(document.getElementById("root")!).render(<App />);
