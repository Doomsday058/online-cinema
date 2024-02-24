const express = require("express");
const app = express();
const Sequelize = require("sequelize");
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv').config();

// Настройка подключения к базе данных
const sequelize = new Sequelize(process.env.database, "root", process.env.password, {
    dialect: "mysql",
    host: "localhost",
    port: 3307,
    define: {
      timestamps: false
    }
});

app.use(express.json());
app.use(cors({
  origin: 'http://localhost:3000', // Разрешить запросы только с этого источника
  methods: ['GET', 'POST', 'DELETE', 'UPDATE', 'PUT', 'PATCH']
}));

// Модель для фильма
const Movie = sequelize.define('movie', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    allowNull: false
  },
  title: Sequelize.STRING,
  description: Sequelize.TEXT,
  poster_url: Sequelize.STRING,
  rating: Sequelize.DECIMAL(10, 2),
  production_year: Sequelize.INTEGER,
  duration: Sequelize.INTEGER, // Длительность в минутах
  country: Sequelize.STRING,
  genre: Sequelize.STRING,
  director: Sequelize.STRING,
  age_rating: Sequelize.INTEGER,
  main_roles: Sequelize.TEXT // JSON или строковое представление для актёров и ролей
});

const Serial = sequelize.define('serial', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    allowNull: false
  },
  title: Sequelize.STRING,
  description: Sequelize.TEXT,
  poster_url: Sequelize.STRING,
  rating: Sequelize.DECIMAL(10, 2),
  production_year: Sequelize.INTEGER,
  duration: Sequelize.INTEGER, // Длительность в минутах
  country: Sequelize.STRING,
  genre: Sequelize.STRING,
  director: Sequelize.STRING,
  age_rating: Sequelize.INTEGER,
  main_roles: Sequelize.TEXT // JSON или строковое представление для актёров и ролей
},{
  tableName: 'serials' // Имя таблицы для сериалов
});

const User = sequelize.define('user', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    allowNull: false
  },
  username: Sequelize.STRING,
  password: Sequelize.STRING // Пароли должны быть хэшированы
});

// Регистрация пользователя
app.post("/api/register", async (req, res) => {
  const { username, password } = req.body;

  // Проверяем, существует ли уже пользователь с таким именем
  const userExists = await User.findOne({ where: { username } });
  if (userExists) {
    return res.status(400).json({ message: 'User already exists' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  try {
    const newUser = await User.create({ username, password: hashedPassword });
    res.status(201).json(newUser);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});


// Аутентификация пользователя
app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ where: { username } });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: "Invalid password" });
    }
    // Здесь можно создать и вернуть токен для аутентификации
    res.status(200).json({ message: "Login successful" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Оценка фильма пользователем
app.post("/api/movies/:id/rate", async (req, res) => {
  const { userId } = req.body;
  const { id } = req.params;
  const { rating } = req.body;
  try {
    const movie = await Movie.findByPk(id);
    if (!movie) {
      return res.status(404).json({ message: "Movie not found" });
    }
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const existingRating = await Rating.findOne({ where: { userId, movieId: id } });
    if (existingRating) {
      await existingRating.update({ rating });
    } else {
      await Rating.create({ userId, movieId: id, rating });
    }
    res.status(200).json({ message: "Rating saved successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Получение списка оцененных фильмов пользователем
app.get("/api/users/:userId/ratings", async (req, res) => {
  const { userId } = req.params;
  try {
    const ratings = await Rating.findAll({ where: { userId } });
    res.status(200).json(ratings);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});


const Rating = sequelize.define('rating', {
  userId: {
    type: Sequelize.INTEGER,
    references: {
      model: User,
      key: 'id'
    }
  },
  movieId: {
    type: Sequelize.INTEGER,
    references: {
      model: Movie, // или Serial
      key: 'id'
    }
  },
  rating: Sequelize.INTEGER
});

// Маршрут для получения списка пользователей
app.get("/api/users", async (req, res) => {
  try {
    const users = await User.findAll();
    res.status(200).json(users);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Маршрут для получения списка оценок пользователей
app.get("/api/ratings", async (req, res) => {
  try {
    const ratings = await Rating.findAll();
    res.status(200).json(ratings);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});


app.put("/api/movies/:id", function(request, response){
  const movieId = request.params.id;
  const { title, description, poster_url, rating, production_year, duration, country, genre, director, age_rating, main_roles } = request.body;

  Movie.findByPk(movieId).then(movie => {
    if (!movie) {
      response.status(404).send("Фильм не найден");
    } else {
      movie.title = title;
      movie.description = description;
      movie.poster_url = poster_url;
      movie.rating = rating;
      movie.production_year = production_year;
      movie.duration = duration;
      movie.country = country;
      movie.genre = genre;
      movie.director = director;
      movie.age_rating = age_rating;
      movie.main_roles = main_roles;

      movie.save().then(() => {
        response.send("Фильм успешно обновлен");
      }).catch(error => {
        console.error('Ошибка обновления фильма:', error);
        response.status(500).send("Ошибка обновления фильма");
      });
    }
  }).catch(error => {
    console.error('Ошибка поиска фильма:', error);
    response.status(500).send("Ошибка обновления фильма");
  });
});

app.put("/api/serials/:id", function(request, response){
  const serialId = request.params.id;
  const { title, description, poster_url, rating, production_year, duration, country, genre, director, age_rating, main_roles } = request.body;
  
  Serial.findByPk(serialId).then(serial => {
    if (!serial) {
      return response.status(404).send("Сериал не найден");
    }

    serial.title = title;
    serial.description = description;
    serial.poster_url = poster_url;
    serial.rating = rating;
    serial.production_year = production_year;
    serial.duration = duration;
    serial.country = country;
    serial.genre = genre;
    serial.director = director;
    serial.age_rating = age_rating;
    serial.main_roles = main_roles;

    serial.save().then(() => {
      response.send("Сериал успешно обновлен");
    }).catch(error => {
      console.error('Ошибка обновления сериала:', error);
      response.status(500).send("Ошибка обновления сериала");
    });
  }).catch(error => {
    console.error('Ошибка поиска сериала для обновления:', error);
    response.status(500).send("Ошибка обновления сериала");
  });
});


// Маршрут для обновления фильма
app.patch("/api/movies/:id", function(request, response){
  const movieId = request.params.id;
  const { title, description, poster_url, rating, production_year, duration, country, genre, director, age_rating, main_roles } = request.body;
  
  Movie.findByPk(movieId).then(movie => {
    if (!movie) {
      return response.status(404).send("Фильм не найден");
    }

    movie.update({
      title: title,
      description: description,
      poster_url: poster_url,
      rating: rating,
      production_year: production_year,
      duration: duration,
      country: country,
      genre: genre,
      director: director,
      age_rating: age_rating,
      main_roles: main_roles
    }).then(updatedMovie => {
      response.send(updatedMovie);
    }).catch(error => {
      console.error('Ошибка обновления фильма:', error);
      response.status(500).send("Ошибка обновления фильма");
    });
  }).catch(error => {
    console.error('Ошибка поиска фильма для обновления:', error);
    response.status(500).send("Ошибка обновления фильма");
  });
});

// Маршрут для обновления сериала
app.patch("/api/serials/:id", function(request, response){
  const serialId = request.params.id;
  const { title, description, poster_url, rating, production_year, duration, country, genre, director, age_rating, main_roles } = request.body;
  
  Serial.findByPk(serialId).then(serial => {
    if (!serial) {
      return response.status(404).send("Сериал не найден");
    }

    serial.update({
      title: title,
      description: description,
      poster_url: poster_url,
      rating: rating,
      production_year: production_year,
      duration: duration,
      country: country,
      genre: genre,
      director: director,
      age_rating: age_rating,
      main_roles: main_roles
    }).then(updatedSerial => {
      response.send(updatedSerial);
    }).catch(error => {
      console.error('Ошибка обновления сериала:', error);
      response.status(500).send("Ошибка обновления сериала");
    });
  }).catch(error => {
    console.error('Ошибка поиска сериала для обновления:', error);
    response.status(500).send("Ошибка обновления сериала");
  });
});


// Маршруты для работы с списком фильмов
app.get("/api/movies", function(request, response){
    Movie.findAll({ raw: true }).then(movies => {
        response.send(movies);
    });
});

// Маршруты для работы с списком сериалов
app.get("/api/serials", function(request, response) {
  Serial.findAll({ raw: true }).then(serials => {
    response.send(serials);
  }).catch(error => {
    console.error('Ошибка получения списка сериалов:', error);
    response.status(500).send("Ошибка получения списка сериалов");
  });
});


app.get("/api/movies/:id", (req, res) => {
  const id = req.params.id;
  Movie.findByPk(id)
      .then(movie => {
          if (movie) {
              res.json(movie);
          } else {
              res.status(404).send('Фильм не найден');
          }
      })
      .catch(error => res.status(500).send(error.message));
});

app.get("/api/serials/:id", (req, res) => {
  const id = req.params.id;
  Serial.findByPk(id)
      .then(serial => {
          if (serial) {
              res.json(serial);
          } else {
              res.status(404).send('Сериал не найден');
          }
      })
      .catch(error => res.status(500).send(error.message));
});


app.post("/api/movies", function(request, response){
  const { title, description, poster_url, rating, production_year, duration, country, genre, director, age_rating, main_roles } = request.body;
  Movie.create({
      title: title,
      description: description,
      poster_url: poster_url,
      rating: rating,
      production_year: production_year,
      duration: duration,
      country: country,
      genre: genre,
      director: director,
      age_rating: age_rating,
      main_roles: main_roles
  }).then(movie => {
      response.send("Фильм успешно добавлен");
  }).catch(error => {
      console.error('Ошибка добавления фильма:', error);
      response.status(500).send("Ошибка добавления фильма");
  });
});

app.post("/api/serials", function(request, response){
  const { title, description, poster_url, rating, production_year, duration, country, genre, director, age_rating, main_roles } = request.body;
  Serial.create({
      title: title,
      description: description,
      poster_url: poster_url,
      rating: rating,
      production_year: production_year,
      duration: duration,
      country: country,
      genre: genre,
      director: director,
      age_rating: age_rating,
      main_roles: main_roles
  }).then(serial => {
      response.send("Сериал успешно добавлен");
  }).catch(error => {
      console.error('Ошибка добавления сериала:', error);
      response.status(500).send("Ошибка добавления сериала");
  });
});


// Маршрут для удаления фильма
app.delete("/api/movies/:id", function(request, response){
  const movieId = request.params.id;

  Movie.findByPk(movieId).then(movie => {
    if (!movie) {
      response.status(404).send("Фильм не найден");
    } else {
      movie.destroy().then(() => {
        response.send("Фильм успешно удален");
      }).catch(error => {
        console.error('Ошибка удаления фильма:', error);
        response.status(500).send("Ошибка удаления фильма");
      });
    }
  }).catch(error => {
    console.error('Ошибка поиска фильма:', error);
    response.status(500).send("Ошибка удаления фильма");
  });
});

// Маршрут для удаления сериала
app.delete("/api/serials/:id", function(request, response){
  const serialId = request.params.id;

  Serial.findByPk(serialId).then(serial => {
    if (!serial) {
      return response.status(404).send("Сериал не найден");
    }

    serial.destroy().then(() => {
      response.send("Сериал успешно удален");
    }).catch(error => {
      console.error('Ошибка удаления сериала:', error);
      response.status(500).send("Ошибка удаления сериала");
    });
  }).catch(error => {
    console.error('Ошибка поиска сериала для удаления:', error);
    response.status(500).send("Ошибка удаления сериала");
  });
});


// Запуск сервера
sequelize.sync().then(() => {
  app.listen(process.env.port, () => {
    console.log(`Server running on port ${process.env.port}`);
  });
});

module.exports = {
  User,
  Movie,
  Serial,
  sequelize
};
