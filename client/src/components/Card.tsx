import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Card.css';

interface CardProps {
  id: number;
  title: string;
  poster: string;
  rating?: number;
  type: 'movie' | 'serial'; // Добавлено поле для определения типа контента
}

const Card: React.FC<CardProps> = ({ id, title, poster, rating, type }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/${type}s/${id}`);
  };

  return (
    <div className="card" onClick={handleClick}>
      <div className="card__img-wrapper">
      <img src={poster} alt={title} className="card-poster" />
      </div>
      <div className="card-info">
        <h3 className="card-title">{title}</h3>
        {rating && <div className="card-rating">⭐ {rating}</div>}
      </div>
    </div>
  );
};

export default Card;
