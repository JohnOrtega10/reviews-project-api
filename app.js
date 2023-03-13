const express = require('express');
const cors = require('cors');

const { routerUsers } = require('./routes/users.routes');
const { routerBooks } = require('./routes/books.routes');
const { routerReviews } = require('./routes/reviews.routes');

const { globalErrorHandler } = require('./controllers/error.controller');

const app = express();

app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//Endpoints
app.use('/api/users', routerUsers);
app.use('/api/books', routerBooks);
app.use('/api/reviews', routerReviews);

app.use(globalErrorHandler);

module.exports = { app };
