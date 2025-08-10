import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import SideNavigation from './components/SideNavigation';
import ConversationList from './components/ConversationList';
import ChatWindow from './components/ChatWindow';
import Welcome from './components/Welcome';
import config from './config';
import './App.css';

const socket = io(config.socket.url);

function App() {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [showChatOnMobile, setShowChatOnMobile] = useState(false);
  const [activeMenu, setActiveMenu] = useState('chats');

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    fetchConversations();

    // Socket event listeners
    socket.on('newMessage', (message) => {
      if (selectedConversation && message.waId === selectedConversation._id) {
        setMessages(prev => [...prev, message]);
      }
      fetchConversations(); // Refresh conversations to update last message
    });

    socket.on('statusUpdate', (update) => {
      setMessages(prev => 
        prev.map(msg => 
          msg.messageId === update.messageId 
            ? { ...msg, status: update.status }
            : msg
        )
      );
    });

    return () => {
      socket.off('newMessage');
      socket.off('statusUpdate');
    };
  }, [selectedConversation]);

  const fetchConversations = async () => {
    try {
      const response = await fetch(`${config.api.baseUrl}/conversations`);
      const data = await response.json();
      setConversations(data);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    }
  };

  const fetchMessages = async (waId) => {
    try {
      const response = await fetch(`${config.api.baseUrl}/conversations/${waId}/messages`);
      const data = await response.json();
      setMessages(data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const handleConversationSelect = (conversation) => {
    setSelectedConversation(conversation);
    fetchMessages(conversation._id);
    if (isMobile) {
      setShowChatOnMobile(true);
    }
  };

  const handleBackToConversations = () => {
    setShowChatOnMobile(false);
    setSelectedConversation(null);
  };

  const handleMenuSelect = (menuId) => {
    setActiveMenu(menuId);
    if (menuId !== 'chats') {
      setSelectedConversation(null);
      setShowChatOnMobile(false);
    }
  };

  const sendMessage = async (messageBody) => {
    if (!selectedConversation) return;

    try {
      const response = await fetch(`${config.api.baseUrl}/conversations/${selectedConversation._id}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messageBody,
          userName: 'Business'
        }),
      });

      if (response.ok) {
        const newMessage = await response.json();
        setMessages(prev => [...prev, newMessage]);
        fetchConversations(); // Refresh conversations
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  if (isMobile) {
    return (
      <div className="app">
        {!showChatOnMobile ? (
          <>
            <SideNavigation 
              onMenuSelect={handleMenuSelect} 
              activeMenu={activeMenu}
              conversations={conversations}
            />
            <div className="mobile-content">
              {activeMenu === 'chats' ? (
                <ConversationList
                  conversations={conversations}
                  onConversationSelect={handleConversationSelect}
                  selectedConversation={selectedConversation}
                />
              ) : (
                <div className="placeholder-content">
                  <h3>{activeMenu.charAt(0).toUpperCase() + activeMenu.slice(1)}</h3>
                  <p>This feature is coming soon!</p>
                </div>
              )}
            </div>
          </>
        ) : (
          <ChatWindow
            conversation={selectedConversation}
            messages={messages}
            onSendMessage={sendMessage}
            onBack={handleBackToConversations}
            isMobile={true}
          />
        )}
      </div>
    );
  }

  return (
    <div className="app">
      <div className="app-container">
        <SideNavigation 
          onMenuSelect={handleMenuSelect} 
          activeMenu={activeMenu}
          conversations={conversations}
        />
        <div className="sidebar">
          {activeMenu === 'chats' ? (
            <ConversationList
              conversations={conversations}
              onConversationSelect={handleConversationSelect}
              selectedConversation={selectedConversation}
            />
          ) : (
            <div className="placeholder-sidebar">
              <div className="placeholder-header">
                <h2>{activeMenu.charAt(0).toUpperCase() + activeMenu.slice(1)}</h2>
              </div>
              <div className="placeholder-content">
                <div className="coming-soon">
                  <div className="coming-soon-icon">
                    {activeMenu === 'status' && '📸'}
                    {activeMenu === 'channels' && '📺'}
                    {activeMenu === 'communities' && '👥'}
                  </div>
                  <h3>Coming Soon</h3>
                  <p>This feature will be available in the next update.</p>
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="main-content">
          {selectedConversation && activeMenu === 'chats' ? (
            <ChatWindow
              conversation={selectedConversation}
              messages={messages}
              onSendMessage={sendMessage}
              isMobile={false}
            />
          ) : (
            <Welcome />
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
