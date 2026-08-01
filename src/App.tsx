/** App root — routing and auth guard */

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/contexts/auth';
import AppLayout from '@/layouts/AppLayout';

// Pages
import LoginPage from '@/pages/Login';
import Dashboard from '@/pages/Dashboard';
import ModelProviders from '@/pages/ModelProviders';
import KnowledgeBases from '@/pages/KnowledgeBases';
import Agents from '@/pages/Agents';
import Conversations from '@/pages/Conversations';
import Prompts from '@/pages/Prompts';
import Workflows from '@/pages/Workflows';
import Evaluations from '@/pages/Evaluations';
import Costs from '@/pages/Costs';
import Settings from '@/pages/Settings';
import Users from '@/pages/Users';
import Roles from '@/pages/Roles';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="models" element={<ModelProviders />} />
        <Route path="knowledge" element={<KnowledgeBases />} />
        <Route path="agents" element={<Agents />} />
        <Route path="conversations" element={<Conversations />} />
        <Route path="prompts" element={<Prompts />} />
        <Route path="workflows" element={<Workflows />} />
        <Route path="evaluations" element={<Evaluations />} />
        <Route path="costs" element={<Costs />} />
        <Route path="users" element={<Users />} />
        <Route path="roles" element={<Roles />} />
        <Route path="settings" element={<Settings />} />
      </Route>
    </Routes>
  );
};

export default App;
