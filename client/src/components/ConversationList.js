import React, { useState } from 'react';
import './ConversationList.css';

const ConversationList = ({ conversations, onConversationSelect, selectedConversation }) => {
  const [activeFilter, setActiveFilter] = useState('All');
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      return date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      });
    } else if (diffDays <= 7) {
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('en-US', { 
        day: '2-digit',
        month: '2-digit',
        year: '2-digit'
      });
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

  const filterConversations = (conversations, filter) => {
    switch (filter) {
      case 'Unread':
        return conversations.filter(conv => conv.messageCount > 0);
      case 'Favorites':
        return conversations.filter(conv => conv.isFavorite);
      case 'Groups':
        return conversations.filter(conv => conv.isGroup);
      default:
        return conversations;
    }
  };

  const filteredConversations = filterConversations(conversations, activeFilter);

  return (
    <div className="conversation-list">
      <div className="conversation-list-header">
        <div className="header-content">
          <div className="header-left">
            <h1 className="app-title">WhatsApp</h1>
          </div>
          <div className="header-actions">
            <button className="header-btn" title="New chat">
              <svg width="24" height="24" viewBox="0 0 24 24">
                <path fill="currentColor" d="M19.005 3.175H4.674C3.642 3.175 3 3.789 3 4.821V21.02l3.544-3.514h12.461c1.033 0 2.064-1.06 2.064-2.093V4.821c-.001-1.032-1.032-1.646-2.064-1.646zm-4.989 9.869H7.041V11.1h6.975v1.944zm3-4H7.041V7.1h9.975v1.944z"/>
              </svg>
            </button>
            <button className="header-btn" title="Menu">
              <svg width="24" height="24" viewBox="0 0 24 24">
                <path fill="currentColor" d="M12 7a2 2 0 1 0-.001-4.001A2 2 0 0 0 12 7zm0 2a2 2 0 1 0-.001 3.999A2 2 0 0 0 12 9zm0 6a2 2 0 1 0-.001 3.999A2 2 0 0 0 12 15z"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div className="filter-tabs">
        <button 
          className={`filter-tab ${activeFilter === 'All' ? 'active' : ''}`}
          onClick={() => setActiveFilter('All')}
        >
          All
        </button>
        <button 
          className={`filter-tab ${activeFilter === 'Unread' ? 'active' : ''}`}
          onClick={() => setActiveFilter('Unread')}
        >
          Unread
        </button>
        <button 
          className={`filter-tab ${activeFilter === 'Favorites' ? 'active' : ''}`}
          onClick={() => setActiveFilter('Favorites')}
        >
          Favorites
        </button>
        <button 
          className={`filter-tab ${activeFilter === 'Groups' ? 'active' : ''}`}
          onClick={() => setActiveFilter('Groups')}
        >
          Groups
        </button>
      </div>

      <div className="search-container">
        <div className="search-wrapper">
          <div className="search-icon">
            <svg width="24" height="24" viewBox="0 0 24 24">
              <path fill="currentColor" d="M15.009 13.805h-.636l-.22-.219a5.184 5.184 0 0 0 1.256-3.386 5.207 5.207 0 1 0-5.207 5.208 5.183 5.183 0 0 0 3.385-1.255l.221.22v.635l4.004 3.999 1.194-1.195-3.997-4.007zm-4.808 0a3.605 3.605 0 1 1 0-7.21 3.605 3.605 0 0 1 0 7.21z"/>
            </svg>
          </div>
          <input 
            type="text" 
            placeholder="Search or start new chat"
            className="search-input"
          />
        </div>
      </div>

      <div className="conversations-container">
        {filteredConversations.length === 0 ? (
          <div className="no-conversations">
            <p>{activeFilter === 'All' ? 'No conversations yet' : `No ${activeFilter.toLowerCase()} conversations`}</p>
          </div>
        ) : (
          filteredConversations.map((conversation) => (
            <div
              key={conversation._id}
              className={`conversation-item ${
                selectedConversation?._id === conversation._id ? 'active' : ''
              }`}
              onClick={() => onConversationSelect(conversation)}
            >
              <div className="conversation-avatar">
                <div className="avatar-circle">
                  {getAvatarInitials(conversation.userName)}
                </div>
              </div>
              <div className="conversation-content">
                <div className="conversation-header">
                  <div className="conversation-name">
                    {conversation.userName}
                  </div>
                  <div className="conversation-time">
                    {formatTime(conversation.lastMessageTime)}
                  </div>
                </div>
                <div className="conversation-preview">
                  <span className="last-message">
                    {conversation.lastMessage}
                  </span>
                  {conversation.messageCount > 0 && (
                    <div className="message-count">
                      {conversation.messageCount}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ConversationList;
