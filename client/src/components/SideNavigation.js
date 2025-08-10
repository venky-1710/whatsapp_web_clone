import React, { useState } from 'react';
import config from '../config';
import './SideNavigation.css';

const SideNavigation = ({ onMenuSelect, activeMenu, conversations = [] }) => {
  // Calculate count of conversations with unread messages (not total message count)
  const unreadCount = conversations.filter(conversation => 
    conversation.messageCount && conversation.messageCount > 0
  ).length;
  
  // You can easily change this to your Google profile image URL
  const profileImageUrl = "https://lh3.googleusercontent.com/a/ACg8ocKxVyVZKjAkgzMOcyGiUbtm6-XOdZGlL_YQbKFh2Q=s96-c";
  const fallbackImageUrl = `${config.external.avatarApiUrl}/?name=User&background=00a884&color=fff&size=96&bold=true`;

  const menuItems = [
    {
      id: 'chats',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24">
          <path fill="currentColor" d="M19.005 3.175H4.674C3.642 3.175 3 3.789 3 4.821V21.02l3.544-3.514h12.461c1.033 0 2.064-1.06 2.064-2.093V4.821c-.001-1.032-1.032-1.646-2.064-1.646zm-4.989 9.869H7.041V11.1h6.975v1.944zm3-4H7.041V7.1h9.975v1.944z"/>
        </svg>
      ),
      label: 'Chats',
      hasNotification: true,
      count: unreadCount
    },
    {
      id: 'status',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2"/>
          <circle cx="12" cy="12" r="3" fill="currentColor"/>
        </svg>
      ),
      label: 'Status',
      hasNotification: false
    },
    {
      id: 'channels',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24">
          <path fill="currentColor" d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
        </svg>
      ),
      label: 'Channels',
      hasNotification: false
    },
    {
      id: 'communities',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24">
          <path fill="currentColor" d="M16 4c0-1.11.89-2 2-2s2 .89 2 2-.89 2-2 2-2-.89-2-2zm4 18v-6h2.5l-2.54-7.63A3.001 3.001 0 0 0 17 6c-1.66 0-3 1.34-3 3 0 .35.07.69.18 1H14c-1.66 0-3 1.34-3 3v8h10zM12.5 11.5c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5S11 9.17 11 10s.67 1.5 1.5 1.5zM5.5 6c1.11 0 2-.89 2-2s-.89-2-2-2-2 .89-2 2 .89 2 2 2zm2.5 16v-7H6v-2c0-1.66 1.34-3 3-3h1c.35 0 .69.07 1 .18V8c0-1.66-1.34-3-3-3S5 6.34 5 8v2H3.5C2.67 10 2 10.67 2 11.5S2.67 13 3.5 13H5v7h3z"/>
        </svg>
      ),
      label: 'Communities',
      hasNotification: false
    }
  ];

  return (
    <div className="side-navigation">
      <div className="side-nav-header">
        <div className="logo-container">
          <div className="whatsapp-logo">
            <svg width="32" height="32" viewBox="0 0 24 24">
              <path fill="#25D366" d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.525 3.488"/>
            </svg>
          </div>
        </div>
      </div>

      <div className="side-nav-menu">
        {menuItems.map((item) => (
          <div
            key={item.id}
            className={`side-nav-item ${activeMenu === item.id ? 'active' : ''}`}
            onClick={() => onMenuSelect(item.id)}
            title={item.label}
          >
            <div className="nav-icon">
              {item.icon}
            </div>
            {item.hasNotification && item.count > 0 && (
              <div className="notification-badge">
                {item.count > 99 ? '99+' : item.count}
              </div>
            )}
            <div className="nav-label">{item.label}</div>
          </div>
        ))}
      </div>

      <div className="side-nav-footer">
        <div className="side-nav-item settings-item" title="Settings">
          <div className="nav-icon">
            <svg width="24" height="24" viewBox="0 0 24 24">
              <path fill="currentColor" d="M12,15.5A3.5,3.5 0 0,1 8.5,12A3.5,3.5 0 0,1 12,8.5A3.5,3.5 0 0,1 15.5,12A3.5,3.5 0 0,1 12,15.5M19.43,12.97C19.47,12.65 19.5,12.33 19.5,12C19.5,11.67 19.47,11.34 19.43,11.03L21.54,9.37C21.73,9.22 21.78,8.95 21.66,8.73L19.66,5.27C19.54,5.05 19.27,4.96 19.05,5.05L16.56,6.05C16.04,5.66 15.5,5.32 14.87,5.07L14.5,2.42C14.46,2.18 14.25,2 14,2H10C9.75,2 9.54,2.18 9.5,2.42L9.13,5.07C8.5,5.32 7.96,5.66 7.44,6.05L4.95,5.05C4.73,4.96 4.46,5.05 4.34,5.27L2.34,8.73C2.22,8.95 2.27,9.22 2.46,9.37L4.57,11.03C4.53,11.34 4.5,11.67 4.5,12C4.5,12.33 4.53,12.65 4.57,12.97L2.46,14.63C2.27,14.78 2.22,15.05 2.34,15.27L4.34,18.73C4.46,18.95 4.73,19.03 4.95,18.95L7.44,17.94C7.96,18.34 8.5,18.68 9.13,18.93L9.5,21.58C9.54,21.82 9.75,22 10,22H14C14.25,22 14.46,21.82 14.5,21.58L14.87,18.93C15.5,18.68 16.04,18.34 16.56,17.94L19.05,18.95C19.27,19.03 19.54,18.95 19.66,18.73L21.66,15.27C21.78,15.05 21.73,14.78 21.54,14.63L19.43,12.97Z"/>
            </svg>
          </div>
        </div>

        <div className="side-nav-item profile-item" title="Profile">
          <div className="profile-avatar">
            <img 
              src={profileImageUrl}
              alt="Profile" 
              className="profile-image"
              onError={(e) => {
                e.target.src = fallbackImageUrl;
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SideNavigation;
