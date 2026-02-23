import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { HomePage } from './components/HomePage';
import { ActivityFeed } from './components/ActivityFeed';
import { ParticipantProfile } from './components/ParticipantProfile';
import { TeamView } from './components/TeamView';
import { EventDetailTabs } from './components/EventDetailTabs';
import { AddActivityForm } from './components/AddActivityForm';
import { AdminPanel } from './components/AdminPanel';
import { ModerationPanel } from './components/ModerationPanel';
import { RoleSelector } from './components/RoleSelector';
import { ActivityView } from './components/ActivityView';
import { MainLayout } from './layouts/MainLayout';

function App() {
  const [showRoleSelector, setShowRoleSelector] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('userRole');
    
    if (!token) {
      localStorage.setItem('token', 'demo-token-12345');
      localStorage.setItem('userId', '1');
    }
    
    if (!userRole) {
      setShowRoleSelector(true);
    }
  }, []);

  const handleRoleSelected = () => {
    setShowRoleSelector(false);
  };

  if (showRoleSelector) {
    return <RoleSelector onRoleSelected={handleRoleSelected} />;
  }

  return (
    <Router basename="/sporttyx">
      <Routes>
        <Route
          path="/"
          element={
            <MainLayout>
              <HomePage />
            </MainLayout>
          }
        />
        <Route
          path="/profile"
          element={
            <MainLayout>
              <ParticipantProfile />
            </MainLayout>
          }
        />
        <Route
          path="/feed"
          element={
            <MainLayout>
              <ActivityFeed />
            </MainLayout>
          }
        />
        <Route
          path="/team/:teamId"
          element={
            <MainLayout>
              <TeamView />
            </MainLayout>
          }
        />
        <Route
          path="/event/:eventId"
          element={
            <MainLayout>
              <EventDetailTabs />
            </MainLayout>
          }
        />
        <Route
          path="/add-activity"
          element={
            <MainLayout>
              <AddActivityForm />
            </MainLayout>
          }
        />
        <Route
          path="/activity/:activityId"
          element={
            <MainLayout>
              <ActivityView />
            </MainLayout>
          }
        />
        <Route
          path="/admin"
          element={
            <MainLayout>
              <AdminPanel />
            </MainLayout>
          }
        />
        <Route
          path="/moderation"
          element={
            <MainLayout>
              <ModerationPanel />
            </MainLayout>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
