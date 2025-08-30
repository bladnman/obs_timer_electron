import { AppMode } from "../contexts/AppContext";

// Canonical mode order for navigation: Right/Down => next, Left/Up => prev
// Requirement: Recording Timer ("obs") first, Timer second, then others
export const modeOrder: AppMode[] = ["obs", "timer", "stopwatch", "clock"];

