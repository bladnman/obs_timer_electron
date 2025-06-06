import {render, screen} from "@testing-library/react";
import React from "react";
import App from "../src/client/App";
import {AppProvider} from "../src/client/contexts/AppContext";

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

  test("renders main application structure", () => {
    // For this test, since AppProvider attempts connection on mount,
    // ensure obsService.connect is appropriately mocked or spied upon.
    renderWithProvider(<App />);

    // Check for some key elements to ensure basic rendering
    // Menu buttons (title is a good way to find them if text is just icons)
    expect(screen.getByTitle("Settings")).toBeInTheDocument();
    expect(screen.getByTitle("Reset Total Time")).toBeInTheDocument();

    // Timer displays - check for time-text containers
    const timerContainers = document.querySelectorAll(".time-text");
    expect(timerContainers.length).toBeGreaterThanOrEqual(1); // Expect at least one, likely two

    // Check that we have time displays showing "00:00:00" format
    const timeDisplays = screen.getAllByText("00:00:00");
    expect(timeDisplays.length).toBeGreaterThanOrEqual(2); // Should have at least 2 timer displays

    // Check that the status icon is present
    expect(document.getElementById("status-icon")).toBeInTheDocument();
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
