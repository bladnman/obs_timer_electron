import "@testing-library/jest-dom";
import {render, screen, waitFor} from "@testing-library/react";
import React from "react";
import App from "../src/client/App";
import {AppProvider} from "../src/client/contexts/AppContext";
import obsService from "../src/client/services/obsService";

// Helper to render with provider
const renderWithProvider = (ui: React.ReactElement) => {
  return render(<AppProvider>{ui}</AppProvider>);
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
    
    // Check for title
    expect(screen.getByText("RECORDING TIMER")).toBeInTheDocument();

    // Check for Settings button in status bar
    expect(screen.getByTitle("Settings")).toBeInTheDocument();
    
    // Check that we have time displays in v2 format
    const timeSegments = document.querySelectorAll(".v2-time-segment");
    expect(timeSegments.length).toBeGreaterThanOrEqual(1); // At least one time segment

    // Check that a status icon is present (v2 class)
    const statusIcons = document.querySelectorAll(".v2-status-icon");
    expect(statusIcons.length).toBeGreaterThanOrEqual(1);
    
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
    
    // Check that error icon is displayed
    const errorIcon = screen.getByText("×");
    expect(errorIcon).toBeInTheDocument();
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
