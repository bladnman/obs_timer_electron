export const CAPTURE_EVENT_OPTIONS: AddEventListenerOptions = {capture: true};

export const isSpaceKey = (event: KeyboardEvent) =>
  event.code === "Space" || event.key === " " || event.key === "Spacebar";
