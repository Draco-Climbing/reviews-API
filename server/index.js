/* eslint-disable no-console */
const express = require('express');
const router = require('./routes/index');

const app = express();

app.use(express.json());
app.use('/*', router);

const port = (process.env.PORT || 8080);

app.listen(port, () => {
  console.log(`active on http://localhost:${port}`);
});
