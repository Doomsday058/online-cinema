// src/App.tsx
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import CardDetails from './components/CardDetails';
import CardList from './components/CardList';
import Footer from './components/Footer';
import NavBar from './components/NavBar';
import AuthForm from './components/AuthForm';
import LoginButton from './components/LoginButton';

const App: React.FC = () => {
  const [showAuthForm, setShowAuthForm] = useState(false);
  const [user, setUser] = useState<string | null>(null);

  const onAuthenticate = (username: string) => {
    setUser(username);
    setShowAuthForm(false);
  };

  const toggleAuthForm = () => {
    setShowAuthForm(!showAuthForm);
  };

  return (
    <Router>
      <div className="App">
        <header className="App-header">
          <div className="header-content">
            <h1 className="page-title">FilmAdviser</h1>
          <div className="auth-elements">
            {user ? <div className = "greeting-message">Welcome, {user}!</div> : <LoginButton onClick={toggleAuthForm} />}
            {showAuthForm && <AuthForm onAuthenticate={onAuthenticate} />}
          </div>
          </div>
        </header>
        <NavBar />
        <div className="main-content">
          <Routes>
            <Route path="/" element={<CardList type="movie" />} />
            <Route path="/movies/:id" element={<CardDetails type="movie" />} />
            <Route path="/serials" element={<CardList type="serial" />} />
            <Route path="/serials/:id" element={<CardDetails type="serial" />} />
          </Routes>
        </div>
        <Footer />
      </div>
    </Router>
  );
};

export default App;
