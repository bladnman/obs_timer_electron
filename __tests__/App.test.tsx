import "@testing-library/jest-dom";
import {fireEvent, render, screen, waitFor} from "@testing-library/react";
import React from "react";
import App from "../src/client/App";
import {AppProvider} from "../src/client/contexts/AppContext";
import {LOCAL_STORAGE_KEYS} from "../src/client/contexts/app_context_types";
import obsService from "../src/client/services/obsService";

// Helper to render with provider
const renderWithProvider = (
  ui: React.ReactElement,
  providerProps: React.ComponentProps<typeof AppProvider> = {}
) => {
  return render(<AppProvider {...providerProps}>{ui}</AppProvider>);
};

// Mock obsService for tests that might trigger its usage through AppProvider effects
jest.mock("../src/client/services/obsService", () => ({
  __esModule: true, // this property makes it work for default exports
  default: {
    connect: jest.fn().mockResolvedValue(undefined),
    disconnect: jest.fn().mockResolvedValue(undefined),
    call: jest.fn().mockResolvedValue({}),
    on: jest.fn(),
    off: jest.fn(),
    registerCallbacks: jest.fn(),
    getVersion: jest.fn().mockResolvedValue({obsVersion: "mock-version"}),
    getRecordStatus: jest.fn().mockResolvedValue({
      outputActive: false,
      outputPaused: false,
      outputTimecode: "00:00:00",
    }),
    // Add other methods as needed by AppContext
  },
}));

describe("<App />", () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
    // Reset localStorage if AppProvider depends on it for initial state
    localStorage.clear();
    window.history.replaceState({}, "", "/");
    delete (window as Window & {electronAPI?: unknown}).electronAPI;
  });

  test("renders main application structure", async () => {
    // For this test, since AppProvider attempts connection on mount,
    // ensure obsService.connect is appropriately mocked or spied upon.
    renderWithProvider(<App />);

    // Wait for v2 layout elements to appear
    await waitFor(() => {
      // Check for AppLayout structure
      expect(document.querySelector(".app-layout-window")).toBeInTheDocument();
    });

    // Check for main layout regions
    expect(document.querySelector(".app-layout-body")).toBeInTheDocument();
    expect(document.querySelector(".app-layout-status-bar")).toBeInTheDocument();
    
    // OBS mode now omits the title; compact layout should be applied
    const windowEl = document.querySelector(".app-layout-window");
    expect(windowEl).toBeInTheDocument();
    expect(windowEl?.classList.contains("app-layout-compact-when-empty")).toBe(true);
    // Verify status bar shows OBS total time label
    expect(screen.getByText("Total:")).toBeInTheDocument();

    // Check for Settings button in status bar
    expect(screen.getByTitle("Settings")).toBeInTheDocument();
    expect(screen.getByRole("button", {name: "OBS Timer"})).toBeInTheDocument();
    expect(screen.getByRole("button", {name: "Clock"})).toBeInTheDocument();
    expect(screen.getByRole("button", {name: "OBS/Clock"})).toBeInTheDocument();
    expect(screen.getByRole("button", {name: "Timer"})).toBeInTheDocument();
    expect(screen.getByRole("button", {name: "Stopwatch"})).toBeInTheDocument();
    
    // Check that we have time displays in v2 format
    const timeSegments = document.querySelectorAll(".v2-time-segment");
    expect(timeSegments.length).toBeGreaterThanOrEqual(1); // At least one time segment

    // OBS availability now lives on the persistent rail
    expect(document.querySelector(".v2-mode-rail-obs-dot")).toBeInTheDocument();
    
    // Verify layout structure follows design spec
    const content = document.querySelector(".app-layout-content");
    expect(content).toBeInTheDocument();
    
    const display = document.querySelector(".app-layout-display");
    expect(display).toBeInTheDocument();
    
    // Check icon rail exists
    const icon = document.querySelector(".app-layout-icon");
    expect(icon).toBeInTheDocument();
    
    // Action rail may or may not exist depending on state
    // Just verify it can be queried without error
    const action = document.querySelector(".app-layout-action");
    // Action is conditional, so we don't assert its existence
  });

  test("shows error state when connection fails", async () => {
    (obsService.connect as jest.Mock).mockRejectedValueOnce(new Error("fail"));
    renderWithProvider(<App />);
    
    // In v2 layout, we show error banner instead of retry button
    await waitFor(() => {
      expect(screen.getByText("OBS NOT FOUND")).toBeInTheDocument();
    });
    
    expect(
      document.querySelector(".v2-mode-rail-obs-dot.unavailable")
    ).toBeInTheDocument();
  });

  test("shows clock fallback in OBS/Clock mode when OBS is unavailable", async () => {
    localStorage.setItem("obsTimerCurrentMode", "obs-clock");
    (obsService.connect as jest.Mock).mockRejectedValueOnce(new Error("fail"));

    renderWithProvider(<App />);

    await waitFor(() => {
      expect(document.querySelector(".v2-clock-display")).toBeInTheDocument();
    });

    expect(screen.getByRole("button", {name: "OBS/Clock"})).toHaveAttribute(
      "aria-pressed",
      "true"
    );
    expect(screen.getAllByText(/OBS unavailable/i).length).toBeGreaterThan(0);
    expect(screen.queryByText("Total:")).not.toBeInTheDocument();
  });

  test("stays on clock fallback while OBS is still connecting", async () => {
    localStorage.setItem("obsTimerCurrentMode", "obs-clock");
    (obsService.connect as jest.Mock).mockImplementationOnce(
      () => new Promise(() => {})
    );

    renderWithProvider(<App />);

    await waitFor(() => {
      expect(document.querySelector(".v2-clock-display")).toBeInTheDocument();
    });

    expect(screen.queryByText("OBS NOT FOUND")).not.toBeInTheDocument();
    expect(document.querySelector(".v2-mode-rail-obs-dot.connecting")).toBeInTheDocument();
  });

  test("opens the Electron settings window when available", async () => {
    const openSettingsWindow = jest.fn().mockResolvedValue(undefined);
    window.electronAPI = {openSettingsWindow};

    renderWithProvider(<App />);

    await waitFor(() => {
      expect(screen.getByTitle("Settings")).toBeInTheDocument();
    });

    screen.getByTitle("Settings").click();

    await waitFor(() => {
      expect(openSettingsWindow).toHaveBeenCalledTimes(1);
    });

    expect(document.querySelector(".modal-overlay")).not.toBeInTheDocument();
  });

  test("renders the dedicated settings view as an embedded page", async () => {
    window.history.replaceState({}, "", "/?view=settings");

    renderWithProvider(<App />, {autoConnectObs: false});

    expect(document.querySelector(".settings-window-root")).toBeInTheDocument();
    expect(document.querySelector(".settings-page-shell")).toBeInTheDocument();
    expect(document.querySelector(".modal-overlay")).not.toBeInTheDocument();
    expect(screen.getByLabelText("OBS Host:")).toBeInTheDocument();
    expect(screen.getByLabelText("Port:")).toBeInTheDocument();
    expect(screen.getByLabelText("Password:")).toBeInTheDocument();
    expect(screen.getByLabelText("Reset total time on launch")).toBeChecked();
    expect(screen.queryByRole("button", {name: /save & connect/i})).not.toBeInTheDocument();
    expect(screen.getByText("Changes save automatically")).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("OBS Host:"), {
      target: {value: "obs-box.local"},
    });

    await waitFor(() => {
      expect(screen.getByText("Saving...")).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(
        localStorage.getItem(LOCAL_STORAGE_KEYS.settings)
      ).toContain("obs-box.local");
    });
  });

  test("resets stored OBS total time on launch by default", async () => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.totalSeconds, "3661");

    renderWithProvider(<App />, {autoConnectObs: false});

    await waitFor(() => {
      expect(localStorage.getItem(LOCAL_STORAGE_KEYS.totalSeconds)).toBe("0");
    });
  });

  test("keeps stored OBS total time when reset on launch is disabled", async () => {
    localStorage.setItem(
      LOCAL_STORAGE_KEYS.settings,
      JSON.stringify({
        host: "localhost",
        port: "4455",
        password: "",
        resetTimeOnLaunch: false,
      })
    );
    localStorage.setItem(LOCAL_STORAGE_KEYS.totalSeconds, "3661");

    renderWithProvider(<App />, {autoConnectObs: false});

    await waitFor(() => {
      expect(document.querySelector(".v2-total-value")?.textContent).toBe(
        "01:01:01"
      );
    });
    expect(localStorage.getItem(LOCAL_STORAGE_KEYS.totalSeconds)).toBe("3661");
  });

  // Add more tests:
  // - Settings modal opening/closing
  // - Timer focus toggle
  // - Reset total time confirmation
});

// Development Configuration Tests
describe("Development Configuration", () => {
  test("package.json has correct development script setup", () => {
    // Import package.json using require since we're in a test environment
    const packageJson = require("../package.json");

    // Verify dev script exists and has proper structure
    expect(packageJson.scripts).toHaveProperty("dev");
    const devScript = packageJson.scripts.dev;

    // Check that dev script includes both Vite and Electron
    expect(devScript).toContain("dev:client");
    expect(devScript).toContain("electron");

    // Verify VITE_DEV_SERVER_URL is set in the dev script
    expect(devScript).toContain("VITE_DEV_SERVER_URL=http://localhost:3000");
  });

  test("package.json has required Electron dependencies", () => {
    const packageJson = require("../package.json");

    // Verify essential dev dependencies exist
    expect(packageJson.devDependencies).toHaveProperty("electron");
    expect(packageJson.devDependencies).toHaveProperty("vite");
    expect(packageJson.devDependencies).toHaveProperty("@vitejs/plugin-react");

    // Verify main entry point is set correctly
    expect(packageJson.main).toBe("src/main.js");
  });

  test("Electron main process file exists and has required structure", () => {
    // This validates that the main process file exists and has key components
    // without trying to execute it
    const fs = require("fs");
    const path = require("path");

    const mainJsPath = path.resolve(process.cwd(), "src/main.js");
    expect(fs.existsSync(mainJsPath)).toBe(true);

    const mainJsContent = fs.readFileSync(mainJsPath, "utf8");

    // Verify key Electron patterns are present
    expect(mainJsContent).toContain("BrowserWindow");
    expect(mainJsContent).toContain("app.whenReady");
    expect(mainJsContent).toContain("createWindow");

    // Verify environment-based loading logic
    expect(mainJsContent).toContain("process.env.VITE_DEV_SERVER_URL");
    expect(mainJsContent).toContain("loadURL");
    expect(mainJsContent).toContain("loadFile");
  });
});
