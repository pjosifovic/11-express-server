'use strict';

const express = require('express');
const mongoose = require('mongoose');
const logger = require('./logger');


const app = express();
let isServerOn = false;
let httpServer = null;

// SETTING UP MONGODB AND mongoose
// -------------------------------
mongoose.Promise = Promise;
// -----------------------------------
// SETTING UP ROUTES
// -------------------------------
app.use(require('./logger-middleware'));

app.use(require('../route/hero-router.js'));

app.all('*', (request, response) => {
  logger.log('info', 'Returning 404 from a catch-all route');
  return response.sendStatus(404);
});
// -----------------------------------
// ERROR MIDDLEWARE
// -----------------------------------
app.use(require('./error-middleware'));
// -----------------------------------


const server = module.exports = {};

server.start = () => {
  return new Promise((resolve, reject) => {
    if(isServerOn){
      logger.log('error', '__SERVER_ERROR__ server is already on');
      return reject(new Error('__SERVER_ERROR__ server is already on'));
    }
    httpServer = app.listen(process.env.PORT, () => {
      isServerOn = true;
      console.log(`Server is listening on port ${process.env.PORT}`);
      logger.log('info', `Server is listening on port ${process.env.PORT}`);
      return resolve();
    });
  })
    .then(mongoose.connect(process.env.MONGODB_URI,{useMongoClient : true}));
};

server.stop = () => {
  return new Promise((resolve, reject) => {
    if(!isServerOn){
      logger.log('error', '__SERVER_ERROR__ server is already off');
      return reject(new Error('__SERVER_ERROR__ server is already off'));
    }
    if(!httpServer){
      logger.log('error', '__SERVER_ERROR__ there is no server to close');
      return reject(new Error('__SERVER_ERROR__ there is no server to close'));
    }
    httpServer.close(() => {
      isServerOn = false;
      httpServer = null;
      logger.log('info', 'Server OFF');
      return resolve();
    });
  })
    .then(() => mongoose.disconnect());
};
