import "@testing-library/jest-dom";
import { render, screen, waitFor } from "@testing-library/react";
import React from "react";
import App from "../src/client/App";
import { AppProvider, useAppContext } from "../src/client/contexts/AppContext";
import obsService from "../src/client/services/obsService";

// Mock obsService (already used in other tests)
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

describe("V2 Arrow Navigation", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  test("Right advances obs -> timer when not editing", async () => {
    localStorage.setItem("obsTimerCurrentMode", "obs");
    renderApp();

    await waitFor(() => {
      expect(screen.getByText("RECORDING TIMER")).toBeInTheDocument();
    });

    // Simulate ArrowRight
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight" }));

    await waitFor(() => {
      // Landing on Timer shows the v2 time display (default 05:00)
      const segments = document.querySelectorAll('.v2-time-segment');
      expect(segments.length).toBeGreaterThanOrEqual(3);
    });
  });

  test("Gated when editing OBS total time (selected segment)", async () => {
    localStorage.setItem("obsTimerCurrentMode", "obs");
    renderApp();

    await waitFor(() => {
      expect(screen.getByText("RECORDING TIMER")).toBeInTheDocument();
    });

    // Select minutes segment by clicking the middle segment
    const total = document.querySelectorAll('.v2-total-segment');
    expect(total.length).toBeGreaterThan(0);
    (total[1] as HTMLElement).click();

    window.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight" }));

    // Still on recording timer
    await waitFor(() => {
      expect(screen.getByText("RECORDING TIMER")).toBeInTheDocument();
    });
  });

  test("Gated during timer segment editing", async () => {
    localStorage.setItem("obsTimerCurrentMode", "timer");
    renderApp();

    await waitFor(() => {
      const segments = document.querySelectorAll('.v2-time-segment');
      expect(segments.length).toBeGreaterThanOrEqual(3);
    });

    // Click minutes to enter edit mode
    const segments = document.querySelectorAll('.v2-time-segment');
    (segments[1] as HTMLElement).click();
    await waitFor(() => expect(segments[1]).toHaveClass('selected'));

    // ArrowRight should move segment selection, not change mode
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight" }));

    await waitFor(() => {
      // Still in TIMER mode
      expect(screen.getByText('TIMER')).toBeInTheDocument();
      // Selection moved to seconds
      const segs = document.querySelectorAll('.v2-time-segment');
      expect(segs[2]).toHaveClass('selected');
    });
  });
});
