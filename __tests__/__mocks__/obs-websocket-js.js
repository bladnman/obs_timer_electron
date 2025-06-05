// Mock for obs-websocket-js
class OBSWebSocket {
  constructor() {
    this.isConnected = false;
  }

  async connect(address, password, options) {
    this.isConnected = true;
    return Promise.resolve();
  }

  async disconnect() {
    this.isConnected = false;
    return Promise.resolve();
  }

  async call(requestType, requestData) {
    // Mock responses for common requests
    switch (requestType) {
      case 'GetVersion':
        return { obsVersion: '30.0.0', obsWebSocketVersion: '5.0.0' };
      case 'GetRecordStatus':
        return { 
          outputActive: false, 
          outputPaused: false, 
          outputTimecode: '00:00:00.000' 
        };
      default:
        return {};
    }
  }

  on(eventType, callback) {
    // Mock event listener registration
  }

  off(eventType, callback) {
    // Mock event listener removal
  }
}

// Mock event types
const OBSEventTypes = {
  RecordStateChanged: 'RecordStateChanged',
};

// Mock response types
const OBSResponseTypes = {
  GetVersion: 'GetVersion',
  GetRecordStatus: 'GetRecordStatus',
};

module.exports = OBSWebSocket;
module.exports.default = OBSWebSocket;
module.exports.OBSEventTypes = OBSEventTypes;
module.exports.OBSResponseTypes = OBSResponseTypes; 