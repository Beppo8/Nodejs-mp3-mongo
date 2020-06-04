const express = require('express');
const morgan = require('morgan');
const cors = require('cors');

const tracksRoutes = require('./routes/tracks.routes');

// Initializations
const app = express();

// Middlewares
app.use(cors());
app.use(morgan('dev'));


// routes
app.use(tracksRoutes);

app.listen(3000);
console.log('Server on port:', 3000);