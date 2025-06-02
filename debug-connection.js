/**
 * Comprehensive OBS WebSocket Debug Tool
 * Tests different connection scenarios to diagnose issues
 */

async function debugOBSConnection() {
  console.log('🔍 Starting comprehensive OBS WebSocket debug...\n');

  // Test 1: Check if port is accessible
  console.log('1. Testing port accessibility...');
  const net = require('net');
  
  const testPort = (port) => {
    return new Promise((resolve) => {
      const socket = new net.Socket();
      socket.setTimeout(2000);
      
      socket.on('connect', () => {
        console.log(`   ✅ Port ${port} is accessible`);
        socket.destroy();
        resolve(true);
      });
      
      socket.on('timeout', () => {
        console.log(`   ❌ Port ${port} - timeout`);
        socket.destroy();
        resolve(false);
      });
      
      socket.on('error', (err) => {
        console.log(`   ❌ Port ${port} - error: ${err.message}`);
        resolve(false);
      });
      
      socket.connect(port, 'localhost');
    });
  };

  const portAccessible = await testPort(4455);
  
  if (!portAccessible) {
    console.log('\n❌ Port 4455 is not accessible. OBS WebSocket is not running.');
    console.log('💡 Make sure OBS is running and WebSocket Server is enabled.');
    return;
  }

  // Test 2: Try connecting with obs-websocket-js
  console.log('\n2. Testing WebSocket connection...');
  
  try {
    const OBSWebSocket = await import('obs-websocket-js').then(m => m.default || m);
    console.log('   ✅ obs-websocket-js module loaded');
    
    const obs = new OBSWebSocket();
    
    // Set up detailed event logging
    obs.on('ConnectionClosed', () => {
      console.log('   📡 Event: Connection closed');
    });

    obs.on('ConnectionError', (error) => {
      console.log('   📡 Event: Connection error -', error.message);
    });

    obs.on('Identified', (data) => {
      console.log('   📡 Event: Identified -', data);
    });

    obs.on('Hello', (data) => {
      console.log('   📡 Event: Hello received -', data);
    });

    console.log('   🔌 Attempting connection to ws://localhost:4455...');
    
    // Test with no password (empty string)
    await obs.connect('ws://localhost:4455', '');
    console.log('   ✅ Successfully connected with empty password!');

    // Get version info
    const version = await obs.call('GetVersion');
    console.log('   📺 OBS Version:', version.obsVersion);
    console.log('   🔌 WebSocket Version:', version.obsWebSocketVersion);

    // Get recording status
    try {
      const recordStatus = await obs.call('GetRecordStatus');
      console.log('   🎬 Recording Status:', {
        isRecording: recordStatus.outputActive,
        timecode: recordStatus.outputTimecode || 'N/A',
        duration: recordStatus.outputDuration || 'N/A'
      });
    } catch (err) {
      console.log('   ⚠️  Could not get recording status:', err.message);
    }

    await obs.disconnect();
    console.log('   ✅ Disconnected successfully');

  } catch (error) {
    console.log('   ❌ WebSocket connection failed:', error.message);
    console.log('   📝 Full error:', error);

    // Test with null password
    console.log('\n3. Testing with null password...');
    try {
      const OBSWebSocket = await import('obs-websocket-js').then(m => m.default || m);
      const obs2 = new OBSWebSocket();
      await obs2.connect('ws://localhost:4455');
      console.log('   ✅ Connected with no password parameter!');
      await obs2.disconnect();
    } catch (err2) {
      console.log('   ❌ Failed with no password parameter:', err2.message);
    }

    // Test with undefined password
    console.log('\n4. Testing with undefined password...');
    try {
      const OBSWebSocket = await import('obs-websocket-js').then(m => m.default || m);
      const obs3 = new OBSWebSocket();
      await obs3.connect('ws://localhost:4455', undefined);
      console.log('   ✅ Connected with undefined password!');
      await obs3.disconnect();
    } catch (err3) {
      console.log('   ❌ Failed with undefined password:', err3.message);
    }
  }

  // Test 3: Check if there are any WebSocket servers running
  console.log('\n5. Checking for WebSocket responses on common ports...');
  const WebSocket = require('ws');
  
  const testWSPort = (port) => {
    return new Promise((resolve) => {
      try {
        const ws = new WebSocket(`ws://localhost:${port}`);
        
        ws.on('open', () => {
          console.log(`   ✅ WebSocket server responding on port ${port}`);
          ws.close();
          resolve(true);
        });
        
        ws.on('error', (err) => {
          console.log(`   ❌ Port ${port} - no WebSocket server: ${err.message}`);
          resolve(false);
        });
        
        setTimeout(() => {
          ws.terminate();
          resolve(false);
        }, 2000);
        
      } catch (err) {
        console.log(`   ❌ Port ${port} - error: ${err.message}`);
        resolve(false);
      }
    });
  };

  await testWSPort(4455);
  await testWSPort(4444);

  console.log('\n🔧 Debug complete!');
  console.log('\n💡 If no connection worked, try:');
  console.log('1. Restart OBS Studio');
  console.log('2. Disable and re-enable WebSocket Server');
  console.log('3. Check if another app is using port 4455');
  console.log('4. Try port 4444 (older OBS versions)');
}

// Run debug
debugOBSConnection().catch(console.error); 