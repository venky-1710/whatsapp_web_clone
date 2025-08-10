const axios = require('axios');

async function testAPI() {
  console.log('🧪 Testing WhatsApp Web Clone API...\n');
  
  try {
    // Test 1: Get conversations
    console.log('1. Testing GET /api/conversations');
    const conversationsResponse = await axios.get('http://localhost:5000/api/conversations');
    console.log(`   ✅ Found ${conversationsResponse.data.length} conversations`);
    
    if (conversationsResponse.data.length > 0) {
      const firstConversation = conversationsResponse.data[0];
      console.log(`   📱 First conversation: ${firstConversation.userName} (${firstConversation._id})`);
      
      // Test 2: Get messages for first conversation
      console.log('\n2. Testing GET /api/conversations/:waId/messages');
      const messagesResponse = await axios.get(`http://localhost:5000/api/conversations/${firstConversation._id}/messages`);
      console.log(`   ✅ Found ${messagesResponse.data.length} messages`);
      
      // Test 3: Send a test message
      console.log('\n3. Testing POST /api/conversations/:waId/messages');
      const testMessage = {
        messageBody: `Test message sent at ${new Date().toLocaleTimeString()}`,
        userName: 'Business'
      };
      
      const sendResponse = await axios.post(`http://localhost:5000/api/conversations/${firstConversation._id}/messages`, testMessage);
      console.log(`   ✅ Message sent successfully: "${sendResponse.data.messageBody}"`);
      
      // Test 4: Get user info
      console.log('\n4. Testing GET /api/users/:waId');
      const userResponse = await axios.get(`http://localhost:5000/api/users/${firstConversation._id}`);
      console.log(`   ✅ User info: ${userResponse.data.name} (${userResponse.data.phoneNumber})`);
    }
    
    console.log('\n🎉 All API tests passed! Your WhatsApp Web Clone is working correctly.');
    
  } catch (error) {
    console.error('❌ API Test failed:', error.message);
    console.log('\n💡 Make sure the server is running on port 5000');
    console.log('   Run: cd server && npm run dev');
  }
}

testAPI();
