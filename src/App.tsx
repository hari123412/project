import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ColumnProvider } from './contexts/ColumnContext';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import NotFound from './pages/NotFound';
import PrivateRoute from './components/common/PrivateRoute';
import Layout from './components/layout/Layout';
import ColumnBuilder from './pages/ColumnBuilder';
import DataEntry from './pages/DataEntry';
import ExportHistory from './pages/ExportHistory';
import Reports from './pages/Reports';

function App() {
  return (
    <Router>
      <AuthProvider>
        <ColumnProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
              <Route index element={<Dashboard />} />
              <Route path="columns" element={<ColumnBuilder />} />
              <Route path="data-entry" element={<DataEntry />} />
              <Route path="exports" element={<ExportHistory />} />
              <Route path="reports" element={<Reports />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </ColumnProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;