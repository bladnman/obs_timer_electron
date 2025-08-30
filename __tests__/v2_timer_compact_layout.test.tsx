import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import React from "react";
import TimerV2Mode from "../src/client/features/v2/timer/TimerV2Mode";

describe("Timer V2 - Compact layout when title/sub-display empty", () => {
  test("renders TIMER in status bar center and collapses empty rails", () => {
    render(
      <TimerV2Mode
        formattedTime={"00:05:00"}
        isRunning={false}
        isSetupMode={false}
        isOvertime={false}
        onToggle={() => {}}
        onReset={() => {}}
        onSetupComplete={() => {}}
        onEnterSetup={() => {}}
        onAdjustTimerBy={() => {}}
      />
    );

    // AppLayout root has the compact class to allow collapsing when empty
    const layoutWindow = document.querySelector('.app-layout-window');
    expect(layoutWindow).toBeInTheDocument();
    expect(layoutWindow).toHaveClass('app-layout-compact-when-empty');

    // Title region exists but is marked empty
    const titleRegion = document.querySelector('.app-layout-title');
    expect(titleRegion).toBeInTheDocument();
    expect(titleRegion).toHaveClass('app-layout-title-empty');
    expect(titleRegion).toBeEmptyDOMElement();

    // Sub-display region exists but is marked empty
    const subRegion = document.querySelector('.app-layout-sub-display');
    expect(subRegion).toBeInTheDocument();
    expect(subRegion).toHaveClass('app-layout-sub-display-empty');
    expect(subRegion).toBeEmptyDOMElement();

    // Mode label appears in status bar center via extraInfo
    const modeLabel = screen.getByText(/TIMER/i);
    expect(modeLabel).toBeInTheDocument();
    const extraInfo = modeLabel.closest('.app-layout-extra-info');
    expect(extraInfo).toBeInTheDocument();

    // Main time display is present
    const timeDisplay = document.querySelector('.v2-time-display');
    expect(timeDisplay).toBeInTheDocument();
  });
});

