import { AppMode } from "../contexts/AppContext";

// Canonical mode order for navigation: Right/Down => next, Left/Up => prev
// Keep Clock adjacent to OBS, and expose the combined OBS/Clock behavior explicitly.
export const modeOrder: AppMode[] = ["obs", "clock", "obs-clock", "timer", "stopwatch"];

export const modeLabels: Record<AppMode, string> = {
  obs: "OBS Timer",
  clock: "Clock",
  "obs-clock": "OBS/Clock",
  timer: "Timer",
  stopwatch: "Stopwatch",
};
