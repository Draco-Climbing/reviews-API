module.exports = {
  handleError: (response, error, message = 'Server error, please try again!') => {
    if (!error.response || !error.response.status) {
      response.status(500).send(message);
    } else {
      response.status(error.response.status).send(error.response.data.message);
    }
  },
};
