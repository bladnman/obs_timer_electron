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

describe("V2 Stopwatch Spacebar", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    localStorage.setItem("obsTimerCurrentMode", "stopwatch");
  });

  test("space toggles start/pause", async () => {
    renderApp();

    await waitFor(() => {
      const segs = document.querySelectorAll('.v2-time-segment');
      expect(segs.length).toBeGreaterThanOrEqual(3);
    });

    const getStartPauseLabel = () => (document.querySelectorAll('.v2-action-button')[0] as HTMLElement).getAttribute('aria-label');
    expect(getStartPauseLabel()).toBe('Start');

    window.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', code: 'Space' }));
    await waitFor(() => expect(getStartPauseLabel()).toBe('Pause'));

    window.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', code: 'Space' }));
    await waitFor(() => expect(getStartPauseLabel()).toBe('Start'));
  });
});

