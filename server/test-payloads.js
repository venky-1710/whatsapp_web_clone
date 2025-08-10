// Test script to demonstrate the payload processing functionality
const PayloadProcessor = require('./process-payloads');

async function runTests() {
  console.log('🧪 WhatsApp Payload Processor Test Suite');
  console.log('════════════════════════════════════════════\n');

  const processor = new PayloadProcessor();

  try {
    // Test 1: Process all payloads
    console.log('Test 1: Processing all payload files...');
    await processor.processAllPayloads();
    console.log('✅ Test 1 completed\n');

    // Test 2: Get all messages
    console.log('Test 2: Fetching all messages...');
    const allMessages = await processor.getAllMessages();
    console.log(`✅ Found ${allMessages.length} messages in database\n`);

    // Test 3: Get messages by conversation (if any exist)
    if (allMessages.length > 0) {
      const firstMessage = allMessages[0];
      console.log('Test 3: Fetching messages by conversation...');
      const convMessages = await processor.getMessagesByConversation(firstMessage.conversationId);
      console.log(`✅ Found ${convMessages.length} messages in conversation ${firstMessage.conversationId}\n`);
    }

    // Test 4: Update message status
    if (allMessages.length > 0) {
      const testMessage = allMessages[0];
      console.log('Test 4: Updating message status...');
      const updatedMessage = await processor.updateMessageStatus(testMessage.messageId, 'read');
      if (updatedMessage) {
        console.log(`✅ Updated message ${testMessage.messageId} status to 'read'\n`);
      }
    }

    // Test 5: Show final summary
    console.log('Test 5: Showing final summary...');
    await processor.showSummary();
    console.log('✅ Test 5 completed\n');

    console.log('🎉 All tests completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    // Close database connection
    const mongoose = require('mongoose');
    await mongoose.connection.close();
    console.log('\n📝 Database connection closed');
  }
}

// Example API usage with axios (if you want to test the API endpoints)
async function testAPIEndpoints() {
  const axios = require('axios');
  const baseURL = `http://localhost:${process.env.PORT || 5000}/api/payloads`;

  console.log('🌐 Testing API Endpoints...');
  console.log('═══════════════════════════════════\n');

  try {
    // Test API: Process payloads
    console.log('API Test 1: Processing payloads via API...');
    const processResponse = await axios.post(`${baseURL}/process`);
    console.log('✅ Process API response:', processResponse.data.message);

    // Test API: Get messages
    console.log('\nAPI Test 2: Fetching messages via API...');
    const messagesResponse = await axios.get(`${baseURL}/messages?limit=10`);
    console.log(`✅ Found ${messagesResponse.data.data.length} messages via API`);

    // Test API: Get summary
    console.log('\nAPI Test 3: Getting summary via API...');
    const summaryResponse = await axios.get(`${baseURL}/summary`);
    console.log('✅ Summary retrieved via API');

    console.log('\n🎉 All API tests completed successfully!');

  } catch (error) {
    console.error('❌ API Test failed:', error.message);
    console.log('\n💡 Make sure the server is running on http://localhost:' + (process.env.PORT || 5000));
    console.log('   Run: npm start or node server.js');
  }
}

// Command line interface
const args = process.argv.slice(2);
const testType = args[0];

if (testType === 'api') {
  testAPIEndpoints();
} else {
  runTests();
}

console.log('\n📚 Usage Examples:');
console.log('  node test-payloads.js        - Run direct database tests');
console.log('  node test-payloads.js api    - Test API endpoints (requires server running)');
