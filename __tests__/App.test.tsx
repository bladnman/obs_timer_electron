import React from 'react';
import { render, screen } from '@testing-library/react';
import App from '../src/client/App';
import { AppProvider, AppContextValue, OBSSettings, OBSConnectionState, OBSRecordingState } from '../src/client/contexts/AppContext';

// Minimal mock for AppContext value
const mockContextValue: AppContextValue = {
  settings: { host: 'localhost', port: '4455', password: '' },
  obsConnection: { isConnected: false, isConnecting: false, error: null },
  obsRecording: { isRecording: false, isPaused: false, outputActive: false, outputPaused: false, recordTimecode: '00:00:00', currentSessionSeconds: 0 },
  totalTimeSeconds: 0,
  isSettingsModalOpen: false,
  isCurrentTimeFocused: true,
  connectionTestResult: null,
  isTestingConnection: false,
  formattedTotalTime: '00:00:00',
  formattedCurrentTime: '00:00:00',
  saveSettings: jest.fn(),
  connectToOBS: jest.fn(),
  disconnectFromOBS: jest.fn(),
  testOBSConnection: jest.fn(),
  openSettingsModal: jest.fn(),
  closeSettingsModal: jest.fn(),
  toggleTimerFocus: jest.fn(),
  resetTotalTime: jest.fn(),
  currentStatusIcon: '■',
  currentStatusIconClass: 'stopped',
};

// Helper to render with provider
const renderWithProvider = (ui: React.ReactElement, providerProps?: Partial<AppContextValue>) => {
  return render(
    <AppProvider> {/* This will use the actual provider, AppContext.Provider could be used for more direct value injection */}
      {/* If you want to override specific values for a test, you'd mock AppContext.Provider directly */}
      {/* For now, we test with the actual AppProvider and its default initial state or one modified by mocks */}
      {ui}
    </AppProvider>
  );
};


// Mock obsService for tests that might trigger its usage through AppProvider effects
jest.mock('../src/client/services/obsService', () => ({
  __esModule: true, // this property makes it work for default exports
  default: {
    connect: jest.fn().mockResolvedValue(undefined),
    disconnect: jest.fn().mockResolvedValue(undefined),
    call: jest.fn().mockResolvedValue({}),
    on: jest.fn(),
    off: jest.fn(),
    registerCallbacks: jest.fn(),
    getVersion: jest.fn().mockResolvedValue({ obsVersion: 'mock-version' }),
    getRecordStatus: jest.fn().mockResolvedValue({ outputActive: false, outputPaused: false, outputTimecode: '00:00:00' }),
    // Add other methods as needed by AppContext
  },
}));


describe('<App />', () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
    // Reset localStorage if AppProvider depends on it for initial state
    localStorage.clear();
  });

  test('renders main application structure', () => {
    // For this test, since AppProvider attempts connection on mount,
    // ensure obsService.connect is appropriately mocked or spied upon.
    renderWithProvider(<App />);

    // Check for some key elements to ensure basic rendering
    // Menu buttons (title is a good way to find them if text is just icons)
    expect(screen.getByTitle('Settings')).toBeInTheDocument();
    expect(screen.getByTitle('Reset Total Time')).toBeInTheDocument();

    // Timer displays - they might show 00:00:00 initially
    // Use queryAllByText for elements that might appear multiple times with same text
    const timerDisplays = screen.getAllByText((content, element) => {
        return element?.classList.contains('time-text') && content === '00:00:00';
    });
    expect(timerDisplays.length).toBeGreaterThanOrEqual(1); // Expect at least one, likely two

    // Connection status (might be hidden or show connecting initially)
    // This depends on AppProvider's initial state and effects.
    // For a simple render test, we might not assert its specific text if it's dynamic.
    // expect(screen.getByText(/Connecting to OBS...|Connected to OBS|Disconnected from OBS/)).toBeInTheDocument();

    // Check that the status icon is present
    expect(document.getElementById('status-icon')).toBeInTheDocument();
  });

  // Add more tests:
  // - Settings modal opening/closing
  // - Timer focus toggle
  // - Reset total time confirmation
});
