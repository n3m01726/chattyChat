// App.jsx
import React, { useState, useEffect, useRef } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LoginScreen } from './features/auth/LoginScreen';
import { RegisterScreen } from './features/auth/RegisterScreen';
import { ChatContainer } from './features/chat/ChatContainer';
import { UserProfile } from './features/profile/UserProfile';
import { AppHeader } from './components/AppHeader';
import { AppFooter } from './components/AppFooter';
import { LeftSidebar } from './components/LeftSidebar';
import { RightSidebar } from './components/RightSidebar';
import { MentionToastContainer } from './features/chat/MentionToastContainer';
import { useSocket } from './hooks/useSocket';
import { useDarkMode } from './hooks/useDarkMode';
import { SOCKET_URL } from './utils/constants';
import './styles/index.scss';

/**
 * Composant principal de l'application avec authentification
 */
function AppContent() {
  const { user, loading: authLoading, logout } = useAuth();
  const [authView, setAuthView] = useState('login'); // 'login' ou 'register'
  const [profileUser, setProfileUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [members, setMembers] = useState([]);
  
  // Sidebars state
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(false);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(true);
  
  // Ref pour le container de messages (pour scroll vers message)
  const messagesContainerRef = useRef(null);
  
  // Hooks custom
  const { darkMode, toggleDarkMode, setDarkModeValue } = useDarkMode();
  const {
    messages,
    userCount,
    typingUsers,
    mentions,        // ← NOUVEAU: Liste des mentions reçues
    joinChat,
    sendMessage,
    emitTyping,
    emitStopTyping,
    deleteMessage,
    removeMention    // ← NOUVEAU: Supprimer une mention du state
  } = useSocket();

  // Rejoindre le chat quand l'utilisateur est authentifié
  useEffect(() => {
    if (user) {
      joinChat(user.username);
      loadUserProfile(user.username);
      loadMembers();
      document.title = `💬 ${user.username} - Chat`;
    }
  }, [user]);

  // Recharger les membres régulièrement
  useEffect(() => {
    if (!user) return;
    
    const interval = setInterval(() => {
      loadMembers();
    }, 10000); // Toutes les 10 secondes
    
    return () => clearInterval(interval);
  }, [user]);

  // Filtrer les mentions pour l'utilisateur actuel
  const userMentions = mentions.filter(
    mention => mention.mentionedUser === user?.username
  );

  const loadUserProfile = async (username) => {
    try {
      const apiUrl = SOCKET_URL.replace(/:\d+$/, ':3001');
      const response = await fetch(`${apiUrl}/api/users/${username}`, {
        credentials: 'include'
      });
      const data = await response.json();
      
      if (data.success) {
        setUserProfile(data.profile);
        if (data.profile.dark_mode !== undefined) {
          setDarkModeValue(data.profile.dark_mode === 1);
        }
      }
    } catch (error) {
      console.error('Erreur lors du chargement du profil:', error);
    }
  };

  const loadMembers = async () => {
    try {
      const apiUrl = SOCKET_URL.replace(/:\d+$/, ':3001');
      const response = await fetch(`${apiUrl}/api/members`, {
        credentials: 'include'
      });
      const data = await response.json();
      
      if (data.success) {
        setMembers(data.members);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des membres:', error);
    }
  };

  const handleUsernameClick = (clickedUsername) => {
    setProfileUser(clickedUsername);
  };

  const handleCloseProfile = () => {
    setProfileUser(null);
  };

  const handleProfileUpdate = (updatedProfile) => {
    if (updatedProfile.username === user?.username) {
      setUserProfile(updatedProfile);
      
      if (updatedProfile.dark_mode !== undefined) {
        setDarkModeValue(updatedProfile.dark_mode === 1);
      }
    }
    loadMembers();
  };

  const handleMentionClick = (mentionedUsername) => {
    // TODO Phase future: Insérer @username dans l'input du MessageInput
    // Pour l'instant, on ouvre juste le profil
    handleUsernameClick(mentionedUsername);
  };

  const handleNavigateToMessage = (messageId) => {
    // Trouver le message dans le DOM et scroller vers lui
    const messageElement = document.getElementById(`message-${messageId}`);
    
    if (messageElement) {
      messageElement.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center' 
      });
      
      // Optionnel: Ajouter un effet de flash/highlight temporaire
      messageElement.classList.add('message--flash');
      setTimeout(() => {
        messageElement.classList.remove('message--flash');
      }, 2000);
    } else {
      console.log('Message non trouvé dans le DOM:', messageId);
      // Le message pourrait être trop ancien et pas chargé
      // TODO Phase future: Charger l'historique jusqu'au message
    }
  };

  const handleSettingsClick = () => {
    console.log('TODO: Ouvrir les paramètres');
    // TODO Phase future: Modal Settings
  };

  const handleLogout = async () => {
    await logout();
    setAuthView('login');
  };

  // Loading state
  if (authLoading) {
    return (
      <div className="app app--login">
        <div className="login-screen">
          <h1>💬 Chargement...</h1>
        </div>
      </div>
    );
  }

  // Not authenticated - show login/register
  if (!user) {
    return (
      <div className="app app--login">
        {authView === 'login' ? (
          <LoginScreen 
            onSwitchToRegister={() => setAuthView('register')}
            onSuccess={() => {}} // User is set automatically via AuthContext
          />
        ) : (
          <RegisterScreen 
            onSwitchToLogin={() => setAuthView('login')}
            onSuccess={() => setAuthView('login')} // After registration, go to login
          />
        )}
      </div>
    );
  }

  // Authenticated - show chat
  return (
    <div className="app app--logged">
      <AppHeader 
        channelName="#general"
        channelDescription="Discussion générale"
        userCount={userCount}
        onMembersClick={() => setRightSidebarOpen(!rightSidebarOpen)}
        onChannelsClick={() => setLeftSidebarOpen(!leftSidebarOpen)}
        leftSidebarOpen={leftSidebarOpen}
        rightSidebarOpen={rightSidebarOpen}
      />
      
      <div className="app-content">
        <LeftSidebar
          isOpen={leftSidebarOpen}
          onClose={() => setLeftSidebarOpen(false)}
          currentChannel="general"
          onChannelClick={(channelId) => console.log('TODO: Switch to channel', channelId)}
        />
        
        <ChatContainer 
          username={user.username}
          userCount={userCount}
          messages={messages}
          typingUsers={typingUsers}
          darkMode={darkMode}
          onToggleDarkMode={toggleDarkMode}
          onSendMessage={sendMessage}
          onTyping={emitTyping}
          onStopTyping={emitStopTyping}
          onUsernameClick={handleUsernameClick}
          userProfile={userProfile}
          onDeleteMessage={deleteMessage}
          members={members}  // ← NOUVEAU: Passer la liste des membres pour autocomplete
        />
        
        <RightSidebar
          members={members}
          isOpen={rightSidebarOpen}
          onClose={() => setRightSidebarOpen(false)}
          onProfileClick={handleUsernameClick}
          onMentionClick={handleMentionClick}
        />
      </div>
      
      <AppFooter 
        username={user.username}
        userProfile={userProfile}
        darkMode={darkMode}
        onProfileClick={() => handleUsernameClick(user.username)}
        onSettingsClick={handleSettingsClick}
        onToggleDarkMode={toggleDarkMode}
        onLogout={handleLogout}
      />
      
      {/* Toast container pour les notifications de mention */}
      <MentionToastContainer
        mentions={userMentions}
        onRemoveMention={removeMention}
        onNavigateToMessage={handleNavigateToMessage}
      />
      
      {/* Modal de profil */}
      {profileUser && (
        <UserProfile
          username={profileUser}
          isOwn={profileUser === user.username}
          onClose={handleCloseProfile}
          darkMode={darkMode}
          onToggleDarkMode={toggleDarkMode}
          onProfileUpdate={handleProfileUpdate}
        />
      )}
    </div>
  );
}

/**
 * App wrapper avec AuthProvider
 */
function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;