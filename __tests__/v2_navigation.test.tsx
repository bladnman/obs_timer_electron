import "@testing-library/jest-dom";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
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

  test("Right advances obs -> clock when not editing", async () => {
    localStorage.setItem("obsTimerCurrentMode", "obs");
    renderApp();

    await waitFor(() => {
      // OBS mode now has no title; verify via status bar total label
      expect(screen.getByText("Total:")).toBeInTheDocument();
    });

    // Simulate ArrowRight
    fireEvent.keyDown(window, { key: "ArrowRight" });

    await waitFor(() => {
      expect(
        screen.getByRole("button", {name: "Clock"})
      ).toHaveAttribute("aria-pressed", "true");
    });
  });

  test("Gated when editing OBS total time (selected segment)", async () => {
    localStorage.setItem("obsTimerCurrentMode", "obs");
    renderApp();

    await waitFor(() => {
      expect(screen.getByText("Total:")).toBeInTheDocument();
    });

    // Select minutes segment by clicking the middle segment
    const total = document.querySelectorAll('.v2-total-segment');
    expect(total.length).toBeGreaterThan(0);
    fireEvent.click(total[1] as HTMLElement);

    fireEvent.keyDown(window, { key: "ArrowRight" });

    // Still on recording timer (verify by status bar total label)
    await waitFor(() => {
      expect(screen.getByText("Total:")).toBeInTheDocument();
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
    fireEvent.click(segments[1] as HTMLElement);
    await waitFor(() => expect(segments[1]).toHaveClass('selected'));

    // ArrowRight should move segment selection, not change mode
    fireEvent.keyDown(window, { key: "ArrowRight" });

    await waitFor(() => {
      // Still in TIMER mode
      expect(screen.getByText('TIMER')).toBeInTheDocument();
      // Selection moved to seconds
      const segs = document.querySelectorAll('.v2-time-segment');
      expect(segs[2]).toHaveClass('selected');
    });
  });

  test("Mode rail buttons change modes directly", async () => {
    localStorage.setItem("obsTimerCurrentMode", "obs");
    renderApp();

    await waitFor(() => {
      expect(screen.getByText("Total:")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", {name: "Timer"}));

    await waitFor(() => {
      expect(screen.getByText("TIMER")).toBeInTheDocument();
      expect(
        screen.getByRole("button", {name: "Timer"})
      ).toHaveAttribute("aria-pressed", "true");
    });
  });

  test("OBS/Clock mode falls back to clock when OBS is unavailable", async () => {
    localStorage.setItem("obsTimerCurrentMode", "obs-clock");
    (obsService.connect as jest.Mock).mockRejectedValueOnce(new Error("fail"));
    renderApp();

    await waitFor(() => {
      expect(document.querySelector(".v2-clock-display")).toBeInTheDocument();
    });

    expect(screen.getByRole("button", {name: "OBS/Clock"})).toHaveAttribute(
      "aria-pressed",
      "true"
    );
  });
});
