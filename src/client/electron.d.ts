export {};

declare global {
  interface Window {
    electronAPI?: {
      openSettingsWindow?: () => Promise<void>;
    };
  }
}
