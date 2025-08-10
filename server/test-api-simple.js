// Simple API test script using Node.js built-in modules
const http = require('http');

// Test configuration
const BASE_URL = `http://localhost:${process.env.PORT || 5000}`;
const API_BASE = '/api/payloads';

// Helper function to make HTTP requests
function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function testAPIs() {
  console.log('🧪 Testing WhatsApp Payload Processor APIs');
  console.log('═══════════════════════════════════════════════\n');

  try {
    // Test 1: Get processing summary
    console.log('Test 1: Getting processing summary...');
    const summaryResponse = await makeRequest('GET', `${API_BASE}/summary`);
    console.log(`✅ Status: ${summaryResponse.status}`);
    if (summaryResponse.data.success) {
      console.log('✅ Summary retrieved successfully\n');
    } else {
      console.log('❌ Summary failed:', summaryResponse.data.error, '\n');
    }

    // Test 2: Get messages with pagination
    console.log('Test 2: Getting messages with pagination...');
    const messagesResponse = await makeRequest('GET', `${API_BASE}/messages?page=1&limit=10`);
    console.log(`✅ Status: ${messagesResponse.status}`);
    if (messagesResponse.data.success) {
      console.log(`✅ Found ${messagesResponse.data.data.length} messages`);
      console.log(`✅ Total: ${messagesResponse.data.pagination.total} messages\n`);
    } else {
      console.log('❌ Messages fetch failed:', messagesResponse.data.error, '\n');
    }

    // Test 3: Get conversation messages
    console.log('Test 3: Getting conversation messages...');
    const convResponse = await makeRequest('GET', `${API_BASE}/conversations/conv_919937320320/messages`);
    console.log(`✅ Status: ${convResponse.status}`);
    if (convResponse.data.success) {
      console.log(`✅ Found ${convResponse.data.data.length} messages in conversation`);
      console.log(`✅ Conversation ID: ${convResponse.data.conversationId}\n`);
    } else {
      console.log('❌ Conversation messages fetch failed:', convResponse.data.error, '\n');
    }

    // Test 4: Process payloads via API
    console.log('Test 4: Processing payloads via API...');
    const processResponse = await makeRequest('POST', `${API_BASE}/process`);
    console.log(`✅ Status: ${processResponse.status}`);
    if (processResponse.data.success) {
      console.log('✅ Payloads processed successfully via API\n');
    } else {
      console.log('❌ Payload processing failed:', processResponse.data.error, '\n');
    }

    // Test 5: Update message status
    console.log('Test 5: Updating message status...');
    const messageId = 'wamid.HBgMOTE5OTY3NTc4NzIwFQIAEhggMTIzQURFRjEyMzQ1Njc4OTA=';
    const statusUpdateResponse = await makeRequest('PUT', `${API_BASE}/messages/${encodeURIComponent(messageId)}/status`, {
      status: 'delivered'
    });
    console.log(`✅ Status: ${statusUpdateResponse.status}`);
    if (statusUpdateResponse.data.success) {
      console.log('✅ Message status updated successfully\n');
    } else {
      console.log('❌ Status update failed:', statusUpdateResponse.data.error, '\n');
    }

    // Test 6: Bulk status update
    console.log('Test 6: Bulk updating message statuses...');
    const bulkUpdateResponse = await makeRequest('POST', `${API_BASE}/messages/bulk-update-status`, {
      updates: [
        { messageId: 'wamid.HBgMOTE5OTY3NTc4NzIwFQIAEhggMTIzQURFRjEyMzQ1Njc4OTA=', status: 'read' },
        { messageId: 'wamid.HBgMOTI5OTY3NjczODIwFQIAEhggQ0FBQkNERUYwMDFGRjEyMzQ1NkZGQTk5RTJCM0I2NzY=', status: 'delivered' }
      ]
    });
    console.log(`✅ Status: ${bulkUpdateResponse.status}`);
    if (bulkUpdateResponse.data.success) {
      console.log('✅ Bulk status update completed\n');
    } else {
      console.log('❌ Bulk update failed:', bulkUpdateResponse.data.error, '\n');
    }

    console.log('🎉 All API tests completed!');

  } catch (error) {
    console.error('❌ API Test failed:', error.message);
    console.log('\n💡 Make sure the server is running on http://localhost:' + (process.env.PORT || 5000));
  }
}

// Run the tests
testAPIs();
