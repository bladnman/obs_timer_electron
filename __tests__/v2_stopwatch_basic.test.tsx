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

describe("V2 Stopwatch Mode", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    localStorage.setItem("obsTimerCurrentMode", "stopwatch");
  });

  test("renders v2 display and action buttons, toggles start/pause", async () => {
    renderApp();

    await waitFor(() => {
      const segs = document.querySelectorAll('.v2-time-segment');
      expect(segs.length).toBeGreaterThanOrEqual(3);
    });

    const buttons = document.querySelectorAll('.v2-action-button');
    expect(buttons.length).toBeGreaterThanOrEqual(2);
    // First is start/pause
    expect(buttons[0]).toHaveAttribute('aria-label', 'Start');

    // Click start
    (buttons[0] as HTMLElement).click();
    await waitFor(() => {
      const updated = document.querySelectorAll('.v2-action-button');
      expect(updated[0]).toHaveAttribute('aria-label', 'Pause');
    });
  });
});

