// src/components/LoginButton.tsx
import React from 'react';
import '../styles/LoginButton.css';

interface LoginButtonProps {
  onClick: () => void; // Добавляем тип для нового пропа onClick
}

const LoginButton: React.FC<LoginButtonProps> = ({ onClick }) => { // Деструктуризация пропа onClick из props
  return (
    <button className="login-btn" onClick={onClick}>
      Login/Register
    </button>
  );
};

export default LoginButton;
