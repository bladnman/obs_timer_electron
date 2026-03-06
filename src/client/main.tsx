import ReactDOM from "react-dom/client";
import App from "./App";
import {AppProvider} from "./contexts/AppContext";
import ErrorBoundary from "./shared/components/ErrorBoundary";
// import './App.css'; // App.css is imported in App.tsx

const params = new URLSearchParams(window.location.search);
const isSettingsView = params.get("view") === "settings";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  // <React.StrictMode> // Temporarily commented out
  <ErrorBoundary>
    <AppProvider autoConnectObs={!isSettingsView}>
      <App />
    </AppProvider>
  </ErrorBoundary>
  // </React.StrictMode> // Temporarily commented out
);
