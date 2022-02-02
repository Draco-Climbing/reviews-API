/* eslint-disable no-console */
// import dotenv
require('dotenv').config();

const app = require('./app');

const port = (process.env.PORT || 8080);

app.listen(port, () => {
  console.log(`active on http://localhost:${port}`);
});
