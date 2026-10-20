import React, { useState } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { ChatProvider } from './context/ChatContext';
import { Sidebar } from './components/Sidebar/Sidebar';
import { Header } from './components/Header/Header';
import { ChatArea } from './components/Chat/ChatArea';

export function AppContent() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className="app-container">
      <Sidebar isCollapsed={isSidebarCollapsed} />
      <div className="main-content">
        <Header toggleSidebar={() => setIsSidebarCollapsed((prev) => !prev)} />
        <ChatArea />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <ChatProvider>
        <AppContent />
      </ChatProvider>
    </ThemeProvider>
  );
}
