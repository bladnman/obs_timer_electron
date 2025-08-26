export const theme = {
  colors: {
    background: {
      primary: "#1a1a1a",
      statusBar: "#0f0f0f",
      overlay: "rgba(0, 0, 0, 0.8)",
    },
    status: {
      recording: "#00ff00",
      paused: "#ffff00",
      stopped: "#666666",
      error: "#ff0000",
      connecting: "#ff9900",
    },
    text: {
      primary: "#ffffff",
      secondary: "#cccccc",
      dimmed: "#888888",
      label: "#999999",
    },
    button: {
      default: "#333333",
      hover: "#444444",
      active: "#555555",
    },
  },
  spacing: {
    xs: "0.25rem",  // 4px
    sm: "0.5rem",   // 8px
    md: "1rem",     // 16px
    lg: "1.5rem",   // 24px
    xl: "2rem",     // 32px
    xxl: "3rem",    // 48px
  },
  typography: {
    mainDisplay: {
      fontSize: "4rem",
      fontWeight: "bold",
      fontFamily: "'Consolas', 'Monaco', 'Lucida Console', monospace",
    },
    label: {
      fontSize: "0.9rem",
      fontWeight: "normal",
      textTransform: "uppercase" as const,
      letterSpacing: "0.1em",
    },
    statusText: {
      fontSize: "0.85rem",
      fontWeight: "normal",
    },
    diminished: {
      fontSize: "0.75rem",
      fontWeight: "normal",
    },
  },
  animation: {
    pulse: "pulse 2s ease-in-out infinite",
    fadeIn: "fadeIn 0.3s ease-in",
    slideUp: "slideUp 0.3s ease-out",
  },
  borderRadius: {
    sm: "4px",
    md: "8px",
    lg: "12px",
  },
} as const;

export type Theme = typeof theme;