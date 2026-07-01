/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { AppProvider } from './app/AppProvider';
import AdminLayout from './components/admin/AdminLayout';
import DashboardPage from './features/dashboard/DashboardPage';
import EventsPage from './features/events/EventsPage';
import JudgesPage from './features/judges/JudgesPage';
import FeedbacksPage from './features/feedbacks/FeedbacksPage';
import LogsPage from './features/logs/LogsPage';
import MembersPage from './features/members/MembersPage';
import AuthPage from './features/auth/AuthPage';
import { useWebSocket } from './hooks/useWebSocket';
import { useUiStore } from './store/useUiStore';
import { useAuthStore } from './store/useAuthStore';

function MainApp() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { isConnected, lastEvent, simulateEvent } = useWebSocket();
  const { isDarkMode, setDarkMode } = useUiStore();
  const { isAuthenticated } = useAuthStore();

  // Handle Initial Theme Load & synchronize with HTML tag classes
  useEffect(() => {
    // Force light mode on load as requested
    setDarkMode(false);
    document.documentElement.classList.remove('dark');
  }, [setDarkMode]);

  if (!isAuthenticated) {
    return <AuthPage />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <DashboardPage 
            onSimulateWebSocket={() => simulateEvent()} 
            lastWebSocketEvent={lastEvent} 
          />
        );
      case 'events':
        return <EventsPage />;
      case 'judges':
        return <JudgesPage />;
      case 'feedbacks':
        return <FeedbacksPage />;
      case 'logs':
        return <LogsPage />;
      case 'members':
        return <MembersPage />;
      default:
        return (
          <DashboardPage 
            onSimulateWebSocket={() => simulateEvent()} 
            lastWebSocketEvent={lastEvent} 
          />
        );
    }
  };

  return (
    <AdminLayout 
      activeTab={activeTab} 
      setActiveTab={setActiveTab}
      webSocketConnected={isConnected}
      onSimulateWebSocket={() => simulateEvent()}
    >
      {renderContent()}
    </AdminLayout>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainApp />
    </AppProvider>
  );
}
