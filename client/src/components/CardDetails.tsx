import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import '../styles/CardDetails.css';

interface CardDetailsProps {
  type: 'movie' | 'serial'; // Добавлено поле для определения типа контента
}

interface CardDetailsData {
  id: number;
  title: string;
  poster_url: string;
  rating: number;
  description: string;
  production_year: number;
  duration: number;
  country: string;
  genre: string;
  director: string;
  age_rating: number;
  main_roles: string;
}

const CardDetails: React.FC<CardDetailsProps> = ({ type }) => {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<CardDetailsData | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!id) {
          throw new Error(`${type} ID is missing`);
        }

        const response = await fetch(`http://localhost:8000/api/${type}s/${id}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch ${type}`);
        }

        const data: CardDetailsData = await response.json();
        setData(data);
      } catch (error) {
        console.error(`Error fetching ${type}:`, error);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id, type]);

  if (!data) {
    return <div>Loading...</div>;
  }

  return (
    <div className="details-container">
      <div className="details__img-wrapper">
      <img className="details-poster" src={data.poster_url} alt={data.title} />
      </div>
      <div className="details-content">
        <h2 className="details-title">{data.title}</h2>
        <p className="details-summary">{data.description}</p>
        <div className="details-wrapper">
        <dl className="details-dl">
          <dt className="details-dt">Rating</dt>
          <dd className="details-dd">{data.rating}</dd>
          <dt className="details-dt">Production Year</dt>
          <dd className="details-dd">{data.production_year}</dd>
          <dt className="details-dt">Duration</dt>
          <dd className="details-dd">{data.duration} minutes</dd>
          <dt className="details-dt">Country</dt>
          <dd className="details-dd">{data.country}</dd>
          <dt className="details-dt">Genre</dt>
          <dd className="details-dd">{data.genre}</dd>
          <dt className="details-dt">Director</dt>
          <dd className="details-dd">{data.director}</dd>
          <dt className="details-dt">Age Rating</dt>
          <dd className="details-dd">{data.age_rating}</dd>
          <dt className="details-dt">Main Roles</dt>
          <dd className="details-dd">{data.main_roles}</dd>
        </dl>
        </div>
      </div>
    </div>
  );
};

export default CardDetails;
