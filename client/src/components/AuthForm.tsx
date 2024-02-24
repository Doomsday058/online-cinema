// src/components/AuthForm.tsx
import React, { useState } from 'react';
import '../styles/AuthForm.css';

interface AuthFormProps {
  onAuthenticate: (username: string) => void;
}

const AuthForm: React.FC<AuthFormProps> = ({ onAuthenticate }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const register = async () => {
    const url = 'http://localhost:8000/api/register';
    const body = JSON.stringify({ username, password });

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: body,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'User already exists');
      }
      onAuthenticate(username);
    } catch (error: any) {
      setError(error.message);
    }
  };

  const login = async () => {
    const url = 'http://localhost:8000/api/login';
    const body = JSON.stringify({ username, password });

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: body,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Authentication failed');
      }

      const data = await response.json();
      onAuthenticate(username);
      localStorage.setItem('authToken', data.token);
    } catch (error: any) {
      setError(error.message);
    }
  };

  const submitAuthForm = async () => {
    setError('');
    if (isRegistering) {
      register();
    } else {
      login();
    }
  };

  const handleAuth = (event: React.FormEvent) => {
    event.preventDefault();
    submitAuthForm();
  };

  const toggleForm = () => {
    setIsRegistering(!isRegistering);
  };

  return (
    <form onSubmit={handleAuth} className="auth-form-container">
      <div>
        <label htmlFor="username">Username:</label>
        <input
          id="username"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
      </div>
      <div>
        <label htmlFor="password">Password:</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      <button type="submit">{isRegistering ? 'Register' : 'Login'}</button>
      <button type="button" onClick={toggleForm}>
        {isRegistering ? 'Already have an account?' : "Don't have an account?"}
      </button>
      {error && <div className="error-message">{error}</div>}
    </form>
  );
};

export default AuthForm;
