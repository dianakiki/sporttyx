import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useSearchParams } from 'react-router-dom';
import { RegistrationForm } from './components/RegistrationForm';
import { LoginForm } from './components/LoginForm';
import RegisterWithInvitation from './components/RegisterWithInvitation';
import { ParticipantProfile } from './components/ParticipantProfile';
import { AddTeamForm } from './components/AddTeamForm';
import { CreateTeamForm } from './components/CreateTeamForm';
import { AddActivityForm } from './components/AddActivityForm';
import { TeamProfile } from './components/TeamProfile';
import { TeamTracker } from './components/TeamTracker';
import { DevNavigation } from './components/DevNavigation';
import { MyTeam } from './components/MyTeam';
import { EditProfile } from './components/EditProfile';
import { EditTeam } from './components/EditTeam';
import { TeamView } from './components/TeamView';
import { ActivityView } from './components/ActivityView';
import { ActivityFeed } from './components/ActivityFeed';
import { AdminPanel } from './components/AdminPanel';
import { HomePage } from './components/HomePage';
import { EventDetailTabs } from './components/EventDetailTabs';
import { EventCard } from './components/EventCard';
import { ModerationPanel } from './components/ModerationPanel';
import { MainLayout } from './layouts/MainLayout';

const PrivateRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
};

const RegisterRoute: React.FC = () => {
  const [searchParams] = useSearchParams();
  const inviteToken = searchParams.get('invite');
  
  return inviteToken ? <RegisterWithInvitation /> : <RegistrationForm />;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Страницы без header (login/register) */}
        <Route path="/register" element={<RegisterRoute />} />
        <Route path="/login" element={<LoginForm />} />
        
        {/* Страницы с header */}
        <Route
          path="/"
          element={
            <PrivateRoute>
              <MainLayout>
                <HomePage />
              </MainLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <MainLayout>
                <ParticipantProfile />
              </MainLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/edit-profile"
          element={
            <PrivateRoute>
              <MainLayout>
                <EditProfile />
              </MainLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/edit-team"
          element={
            <PrivateRoute>
              <MainLayout>
                <EditTeam />
              </MainLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/create-team"
          element={
            <PrivateRoute>
              <MainLayout>
                <CreateTeamForm />
              </MainLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/add-team"
          element={
            <PrivateRoute>
              <MainLayout>
                <AddTeamForm />
              </MainLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/add-activity"
          element={
            <PrivateRoute>
              <MainLayout>
                <AddActivityForm />
              </MainLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/my-team"
          element={
            <PrivateRoute>
              <MainLayout>
                <MyTeam />
              </MainLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/team/:teamId"
          element={
            <PrivateRoute>
              <MainLayout>
                <TeamView />
              </MainLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/activity/:activityId"
          element={
            <PrivateRoute>
              <MainLayout>
                <ActivityView />
              </MainLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/tracker"
          element={
            <PrivateRoute>
              <MainLayout>
                <TeamTracker />
              </MainLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/feed"
          element={
            <PrivateRoute>
              <MainLayout>
                <ActivityFeed />
              </MainLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <PrivateRoute>
              <MainLayout>
                <AdminPanel />
              </MainLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/events/:eventId"
          element={
            <PrivateRoute>
              <MainLayout>
                <EventCard />
              </MainLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/event/:eventId"
          element={
            <PrivateRoute>
              <MainLayout>
                <EventDetailTabs />
              </MainLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/moderation"
          element={
            <PrivateRoute>
              <MainLayout>
                <ModerationPanel />
              </MainLayout>
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
