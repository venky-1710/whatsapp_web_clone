import React, { useState, useEffect, useRef } from 'react';
import './ChatWindow.css';

const ChatWindow = ({ conversation, messages, onSendMessage, onBack, isMobile }) => {
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim()) {
      onSendMessage(newMessage.trim());
      setNewMessage('');
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { 
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'sent':
        return (
          <svg width="16" height="15" viewBox="0 0 16 15">
            <path fill="currentColor" d="M10.91 3.316l-.478-.372a.365.365 0 0 0-.51.063L4.566 9.879a.32.32 0 0 1-.484.033L1.891 7.769a.366.366 0 0 0-.515.006l-.423.433a.364.364 0 0 0 .006.514l3.258 3.185c.143.14.361.125.484-.033l6.272-8.048a.365.365 0 0 0-.063-.51z"/>
          </svg>
        );
      case 'delivered':
        return (
          <svg width="16" height="15" viewBox="0 0 16 15">
            <path fill="currentColor" d="M15.01 3.316l-.478-.372a.365.365 0 0 0-.51.063L8.666 9.879a.32.32 0 0 1-.484.033l-1.692-2.143a.366.366 0 0 0-.515.006l-.423.433a.364.364 0 0 0 .006.514l3.258 3.185c.143.14.361.125.484-.033l6.272-8.048a.365.365 0 0 0-.063-.51zm-4.1 0l-.478-.372a.365.365 0 0 0-.51.063L4.566 9.879a.32.32 0 0 1-.484.033L1.891 7.769a.366.366 0 0 0-.515.006l-.423.433a.364.364 0 0 0 .006.514l3.258 3.185c.143.14.361.125.484-.033l6.272-8.048a.365.365 0 0 0-.063-.51z"/>
          </svg>
        );
      case 'read':
        return (
          <svg width="16" height="15" viewBox="0 0 16 15">
            <path fill="#53bdeb" d="M15.01 3.316l-.478-.372a.365.365 0 0 0-.51.063L8.666 9.879a.32.32 0 0 1-.484.033l-1.692-2.143a.366.366 0 0 0-.515.006l-.423.433a.364.364 0 0 0 .006.514l3.258 3.185c.143.14.361.125.484-.033l6.272-8.048a.365.365 0 0 0-.063-.51zm-4.1 0l-.478-.372a.365.365 0 0 0-.51.063L4.566 9.879a.32.32 0 0 1-.484.033L1.891 7.769a.366.366 0 0 0-.515.006l-.423.433a.364.364 0 0 0 .006.514l3.258 3.185c.143.14.361.125.484-.033l6.272-8.048a.365.365 0 0 0-.063-.51z"/>
          </svg>
        );
      default:
        return null;
    }
  };

  const getAvatarInitials = (name) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const groupMessagesByDate = (messages) => {
    const groups = {};
    messages.forEach(message => {
      const date = formatDate(message.timestamp);
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(message);
    });
    return groups;
  };

  const messageGroups = groupMessagesByDate(messages);

  return (
    <div className="chat-window">
      <div className="chat-header">
        {isMobile && (
          <button className="back-button" onClick={onBack}>
            <svg width="24" height="24" viewBox="0 0 24 24">
              <path fill="currentColor" d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z" transform="rotate(180 12 12)"/>
            </svg>
          </button>
        )}
        <div className="contact-info">
          <div className="contact-avatar">
            <div className="avatar-circle">
              {getAvatarInitials(conversation.userName)}
            </div>
          </div>
          <div className="contact-details">
            <div className="contact-name">{conversation.userName}</div>
            <div className="contact-status">Online</div>
          </div>
        </div>
        <div className="chat-actions">
          <button className="action-btn" title="Search">
            <svg width="24" height="24" viewBox="0 0 24 24">
              <path fill="currentColor" d="M15.009 13.805h-.636l-.22-.219a5.184 5.184 0 0 0 1.256-3.386 5.207 5.207 0 1 0-5.207 5.208 5.183 5.183 0 0 0 3.385-1.255l.221.22v.635l4.004 3.999 1.194-1.195-3.997-4.007zm-4.808 0a3.605 3.605 0 1 1 0-7.21 3.605 3.605 0 0 1 0 7.21z"/>
            </svg>
          </button>
          <button className="action-btn" title="Menu">
            <svg width="24" height="24" viewBox="0 0 24 24">
              <path fill="currentColor" d="M12 7a2 2 0 1 0-.001-4.001A2 2 0 0 0 12 7zm0 2a2 2 0 1 0-.001 3.999A2 2 0 0 0 12 9zm0 6a2 2 0 1 0-.001 3.999A2 2 0 0 0 12 15z"/>
            </svg>
          </button>
        </div>
      </div>

      <div className="chat-messages">
        {Object.entries(messageGroups).map(([date, dateMessages]) => (
          <div key={date}>
            <div className="date-separator">
              <span>{date}</span>
            </div>
            {dateMessages.map((message) => {
              const isOutgoing = message.from === '918329446654';
              return (
                <div
                  key={message.messageId}
                  className={`message ${isOutgoing ? 'outgoing' : 'incoming'}`}
                >
                  <div className="message-content">
                    <div className="message-text">{message.messageBody}</div>
                    <div className="message-meta">
                      <span className="message-time">
                        {formatTime(message.timestamp)}
                      </span>
                      {isOutgoing && (
                        <span className="message-status">
                          {getStatusIcon(message.status)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input-container">
        <form onSubmit={handleSendMessage} className="chat-input-form">
          <button type="button" className="emoji-button" title="Emoji">
            <svg width="24" height="24" viewBox="0 0 24 24">
              <path fill="currentColor" d="M9.153 11.603c.795 0 1.439-.879 1.439-1.962s-.644-1.962-1.439-1.962-1.439.879-1.439 1.962.644 1.962 1.439 1.962zm-3.204 1.362c-.026-.307-.131 5.218 6.063 5.551 6.066-.25 6.066-5.551 6.066-5.551-6.078 1.416-12.129 0-12.129 0zm11.363-1.362c.795 0 1.439-.879 1.439-1.962s-.644-1.962-1.439-1.962-1.439.879-1.439 1.962.644 1.962 1.439 1.962zm-7.312 0c.795 0 1.439-.879 1.439-1.962s-.644-1.962-1.439-1.962-1.439.879-1.439 1.962.644 1.962 1.439 1.962z"/>
            </svg>
          </button>
          <button type="button" className="attach-button" title="Attach">
            <svg width="24" height="24" viewBox="0 0 24 24">
              <path fill="currentColor" d="M1.816 15.556v.002c0 1.502.584 2.912 1.646 3.972s2.472 1.647 3.974 1.647a5.58 5.58 0 0 0 3.972-1.645l9.547-9.548c.769-.768 1.147-1.767 1.058-2.817-.079-.968-.548-1.927-1.319-2.698-.789-.789-1.561-1.212-2.655-1.212-1.11 0-2.0.454-2.501.903l-9.547 9.549a3.532 3.532 0 0 0-1.058 2.499 3.532 3.532 0 0 0 1.058 2.499 3.532 3.532 0 0 0 2.499 1.058 3.532 3.532 0 0 0 2.499-1.058l7.08-7.081a1 1 0 0 0-1.414-1.414l-7.08 7.081a1.533 1.533 0 0 1-2.078 0 1.533 1.533 0 0 1 0-2.078l9.549-9.549a.939.939 0 0 1 .665-.287c.271 0 .556.108.775.327.25.25.464.590.472.992.014.703-.271 1.31-.719 1.758l-9.547 9.548a3.581 3.581 0 0 1-2.54 1.054c-.906 0-1.759-.353-2.402-.996a3.391 3.391 0 0 1-.994-2.402c0-.908.355-1.761.994-2.402l9.548-9.547a.998.998 0 0 0 0-1.414.999.999 0 0 0-1.414 0l-9.548 9.547a5.38 5.38 0 0 0-1.58 3.816z"/>
            </svg>
          </button>
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message"
            className="message-input"
          />
          <button type="submit" className="send-button" disabled={!newMessage.trim()}>
            <svg width="24" height="24" viewBox="0 0 24 24">
              <path fill="currentColor" d="M1.101 21.757 23.8 12.028 1.101 2.3l.011 7.912 13.623 1.816-13.623 1.817-.011 7.912z"/>
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatWindow;
