import "@testing-library/jest-dom";
import { render, screen, waitFor, act } from "@testing-library/react";
import React from "react";
import App from "../src/client/App";
import { AppProvider } from "../src/client/contexts/AppContext";

// Mock obsService as in other tests
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

describe("Timer V2 - Edit Mode", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
    localStorage.clear();
    localStorage.setItem("obsTimerCurrentMode", "timer");
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test("click segment selects it and up/down adjust that segment", async () => {
    renderApp();

    await waitFor(() => {
      const segments = document.querySelectorAll('.v2-time-segment');
      expect(segments.length).toBeGreaterThanOrEqual(3);
    });

    const segments = () => Array.from(document.querySelectorAll('.v2-time-segment')) as HTMLElement[];

    // Click minutes (index 1)
    segments()[1].click();
    await waitFor(() => expect(segments()[1]).toHaveClass('selected'));

    // Press ArrowUp once (immediate step)
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp' }));
    // Allow any immediate rendering
    await waitFor(() => {
      const text = segments().map(el => el.textContent).join(':');
      expect(text).toBe('00:06:00');
    });

    // Move right to seconds and hold up
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
    await waitFor(() => expect(segments()[2]).toHaveClass('selected'));

    // Start hold Up
    await act(async () => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp' }));
    });
    await act(async () => {
      // Advance time past hold delay (300ms) and a few ticks
      jest.advanceTimersByTime(700);
    });
    await act(async () => {
      window.dispatchEvent(new KeyboardEvent('keyup', { key: 'ArrowUp' }));
    });

    const afterHold = segments().map(el => el.textContent).join(':');
    // Should be > 00:06:01 (at least 2-3 increments); be conservative: >= 2 seconds
    const [h, m, s] = afterHold.split(':').map(Number);
    expect(m).toBeGreaterThanOrEqual(6);
    expect(s).toBeGreaterThanOrEqual(1);

    // Esc exits edit mode
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    await waitFor(() => {
      expect(segments()[0]).not.toHaveClass('selected');
      expect(segments()[1]).not.toHaveClass('selected');
      expect(segments()[2]).not.toHaveClass('selected');
    });
  });
});
