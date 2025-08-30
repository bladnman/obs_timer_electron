import "@testing-library/jest-dom";
import { render, screen, waitFor } from "@testing-library/react";
import React from "react";
import App from "../src/client/App";
import { AppProvider } from "../src/client/contexts/AppContext";

// Mock obsService to avoid ESM/WebSocket issues
jest.mock("../src/client/services/obsService", () => ({
  __esModule: true,
  default: {
    connect: jest.fn().mockResolvedValue(undefined),
    disconnect: jest.fn().mockResolvedValue(undefined),
    call: jest.fn().mockResolvedValue({}),
    on: jest.fn(),
    off: jest.fn(),
    registerCallbacks: jest.fn(),
    getVersion: jest.fn().mockResolvedValue({ obsVersion: "mock-version" }),
    getRecordStatus: jest.fn().mockResolvedValue({
      outputActive: false,
      outputPaused: false,
      outputTimecode: "00:00:00",
    }),
  },
}));

const renderApp = () => render(<AppProvider><App /></AppProvider>);

describe("V2 Clock Mode", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    localStorage.setItem("obsTimerCurrentMode", "clock");
    localStorage.setItem("obsTimerClockIs24Hour", "true");
  });

  test("renders hours:minutes only, no status bar clock, toggles AM/PM in action rail when clicked", async () => {
    renderApp();

    await waitFor(() => {
      // V2 time display exists
      const display = document.querySelector('.v2-time-display');
      expect(display).toBeInTheDocument();
    });

    // No small status bar clock element should be present
    expect(document.querySelector('.v2-clock-time')).not.toBeInTheDocument();

    // AM/PM not shown in 24-hour mode
    expect(document.querySelector('.v2-clock-ampm-action')).not.toBeInTheDocument();

    // Click the clock to toggle to 12-hour; AM/PM should appear
    const clockContainer = document.querySelector('.v2-clock-container') as HTMLElement;
    clockContainer.click();

    await waitFor(() => {
      expect(document.querySelector('.v2-clock-ampm-action')).toBeInTheDocument();
    });
  });
});
