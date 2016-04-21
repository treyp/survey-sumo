import React, { PropTypes } from 'react';

const NoQuestions =
  ({ type, message }) => <div className={type}>{message}</div>;

NoQuestions.propTypes = {
  type: PropTypes.string.isRequired,
  message: PropTypes.string.isRequired,
};

export default NoQuestions;
