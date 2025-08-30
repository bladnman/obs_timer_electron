import "@testing-library/jest-dom";
import { render, waitFor } from "@testing-library/react";
import React from "react";
import App from "../src/client/App";
import { AppProvider } from "../src/client/contexts/AppContext";

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

describe("V2 Timer Spacebar", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    localStorage.setItem("obsTimerCurrentMode", "timer");
  });

  test("space toggles start/pause when not editing", async () => {
    renderApp();

    await waitFor(() => {
      const segs = document.querySelectorAll('.v2-time-segment');
      expect(segs.length).toBeGreaterThanOrEqual(3);
    });

    const getStartPauseLabel = () => (document.querySelectorAll('.v2-action-button')[0] as HTMLElement).getAttribute('aria-label');
    expect(getStartPauseLabel()).toBe('Start');

    window.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', code: 'Space' }));
    await waitFor(() => expect(getStartPauseLabel()).toBe('Pause'));
  });

  test("space does not toggle while editing a segment", async () => {
    renderApp();

    await waitFor(() => {
      const segs = document.querySelectorAll('.v2-time-segment');
      expect(segs.length).toBeGreaterThanOrEqual(3);
    });

    const getStartPauseLabel = () => (document.querySelectorAll('.v2-action-button')[0] as HTMLElement).getAttribute('aria-label');
    expect(getStartPauseLabel()).toBe('Start');

    // Enter edit mode by clicking minutes
    const segs = document.querySelectorAll('.v2-time-segment');
    (segs[1] as HTMLElement).click();
    await waitFor(() => expect(segs[1]).toHaveClass('selected'));

    window.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', code: 'Space' }));
    // Still Start (not toggled)
    await waitFor(() => expect(getStartPauseLabel()).toBe('Start'));
  });
});

