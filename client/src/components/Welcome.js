import React from 'react';
import './Welcome.css';

const Welcome = () => {
  return (
    <div className="welcome-container">
      <div className="welcome-content">
        <div className="welcome-image">
          <svg width="320" height="240" viewBox="0 0 320 240" fill="none">
            <defs>
              <pattern id="pattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                <circle cx="20" cy="20" r="2" fill="#182229" fillOpacity="0.1"/>
              </pattern>
            </defs>
            <rect width="320" height="240" fill="url(#pattern)"/>
            <g transform="translate(80, 40)">
              <rect x="20" y="40" width="120" height="80" rx="8" fill="#202c33"/>
              <rect x="0" y="60" width="160" height="120" rx="8" fill="#111b21"/>
              <circle cx="50" cy="90" r="15" fill="#00a884"/>
              <rect x="75" y="80" width="60" height="8" rx="4" fill="#8696a0"/>
              <rect x="75" y="95" width="40" height="6" rx="3" fill="#8696a0"/>
              
              <rect x="20" y="130" width="100" height="15" rx="7" fill="#005c4b"/>
              <rect x="40" y="150" width="80" height="15" rx="7" fill="#202c33"/>
              <rect x="25" y="170" width="90" height="15" rx="7" fill="#005c4b"/>
            </g>
          </svg>
        </div>
        <div className="welcome-text">
          <h1>WhatsApp Web</h1>
          <p>
            Send and receive messages without keeping your phone online.
          </p>
          <p>
            Use WhatsApp on up to 4 linked devices and 1 phone at the same time.
          </p>
        </div>
        <div className="welcome-footer">
          <div className="security-info">
            <span className="lock-icon">🔒</span>
            <span>End-to-end encrypted</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Welcome;
