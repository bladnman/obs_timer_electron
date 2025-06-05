console.log("main.tsx: Script execution START");
import ReactDOM from "react-dom/client";
import App from "./App";
import {AppProvider} from "./contexts/AppContext";
// import './App.css'; // App.css is imported in App.tsx

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  // <React.StrictMode> // Temporarily commented out
  <AppProvider>
    <App />
  </AppProvider>
  // </React.StrictMode> // Temporarily commented out
);
