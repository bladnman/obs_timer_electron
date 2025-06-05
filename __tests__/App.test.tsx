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

    // Check that we have time number elements with "00"
    const timeNumbers = screen.getAllByText("00");
    expect(timeNumbers.length).toBeGreaterThanOrEqual(4); // Should have at least 4 "00" spans (2 timers × 2 "00"s each)

    // Check that the status icon is present
    expect(document.getElementById("status-icon")).toBeInTheDocument();
  });

  // Add more tests:
  // - Settings modal opening/closing
  // - Timer focus toggle
  // - Reset total time confirmation
});
