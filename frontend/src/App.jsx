import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from './components/Navbar';
import Feed from './components/Feed';
import Auth from './components/Auth';
import CreatePost from './components/CreatePost';
import Dashboard from './components/Dashboard';
import Profile from './components/Profile';
import LandingPage from './components/LandingPage';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (token && savedUser) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setIsAuthenticated(true);
      setUser(JSON.parse(savedUser));
    }
    setIsCheckingAuth(false);
  }, []);

  const handleLoginSuccess = (userData, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setIsAuthenticated(true);
    setUser(userData);
  };

  const handleLogout = async () => {
    try {
      await axios.post('/logout');
    } catch {}
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
    setIsAuthenticated(false);
    setUser(null);
  };

  if (isCheckingAuth) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <span>Loading portal...</span>
      </div>
    );
  }

  return (
    <Router>
      <Navbar isAuthenticated={isAuthenticated} user={user} onLogout={handleLogout} />
      <Routes>
        <Route path="/" element={
          isAuthenticated ? <Navigate to="/feed" /> : <LandingPage />
        } />

        <Route path="/login" element={
          isAuthenticated ? <Navigate to="/feed" /> :
          <Auth initialIsLogin={true} onLoginSuccess={handleLoginSuccess} />
        } />
        <Route path="/register" element={
          isAuthenticated ? <Navigate to="/feed" /> :
          <Auth initialIsLogin={false} onLoginSuccess={handleLoginSuccess} />
        } />

        <Route path="/feed" element={<Feed isAuthenticated={isAuthenticated} />} />

        <Route path="/create" element={
          isAuthenticated ? <CreatePost /> : <Navigate to="/login" />
        } />
        <Route path="/dashboard" element={
          isAuthenticated ? <Dashboard user={user} /> : <Navigate to="/login" />
        } />
        <Route path="/profile" element={
          isAuthenticated ? <Profile user={user} /> : <Navigate to="/login" />
        } />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;