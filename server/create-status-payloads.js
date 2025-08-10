const fs = require('fs');
const path = require('path');

// Create sample status updates
const statusPayloads = [
  {
    "payload_type": "whatsapp_webhook_status",
    "_id": "conv1-status1",
    "metaData": {
      "entry": [
        {
          "changes": [
            {
              "field": "messages",
              "value": {
                "statuses": [
                  {
                    "id": "wamid.HBgMOTE5OTY3NTc4NzIwFQIAEhggMTIzQURFRjEyMzQ1Njc4OTA=",
                    "status": "delivered",
                    "timestamp": "1754400010",
                    "recipient_id": "919937320320"
                  }
                ]
              }
            }
          ]
        }
      ]
    }
  },
  {
    "payload_type": "whatsapp_webhook_status",
    "_id": "conv1-status2",
    "metaData": {
      "entry": [
        {
          "changes": [
            {
              "field": "messages",
              "value": {
                "statuses": [
                  {
                    "id": "wamid.HBgMOTE5OTY3NTc4NzIwFQIAEhggMTIzQURFRjEyMzQ1Njc4OTA=",
                    "status": "read",
                    "timestamp": "1754400020",
                    "recipient_id": "919937320320"
                  }
                ]
              }
            }
          ]
        }
      ]
    }
  }
];

// Write the status files
statusPayloads.forEach((payload, index) => {
  const filename = `conversation_1_status_${index + 1}.json`;
  const filePath = path.join(__dirname, '..', filename);
  
  fs.writeFileSync(filePath, JSON.stringify(payload, null, 2));
  console.log(`Created ${filename}`);
});

console.log('Status payload files created successfully!');
