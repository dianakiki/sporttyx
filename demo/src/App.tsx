import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { HomePage } from './components/HomePage';
import { ActivityFeed } from './components/ActivityFeed';
import { ParticipantProfile } from './components/ParticipantProfile';
import { TeamView } from './components/TeamView';
import { EventDetailTabs } from './components/EventDetailTabs';
import { MainLayout } from './layouts/MainLayout';

function App() {
  useEffect(() => {
    localStorage.setItem('token', 'demo-token-12345');
    localStorage.setItem('userId', '1');
  }, []);

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
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
