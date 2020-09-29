const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const morgan = require('morgan');
const config = require('./utils/config');
const logger = require('./utils/logger');
const middleware = require('./utils/middleware');
const blogsRouter = require('./controllers/blog');

const app = express();

logger.info('Connecting to', config.MONGODB_URI);

mongoose
  .connect(config.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    logger.info('✔ Connected to Database');
  })
  .catch((error) => {
    logger.error('💥 Error connecting to Database', error.message);
  });

app.use(cors());
app.use(express.json());
app.use(
  morgan(':status :method :url :response-time ms - :res[content-length]')
);

app.use('/api/blogs', blogsRouter);

app.use(middleware.unknownEndpoint);

app.use(middleware.errorHandler);

module.exports = app;
