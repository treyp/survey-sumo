require('es6-promise').polyfill();
import fetch from 'isomorphic-fetch';
import ResponseError from './ResponseError';

function checkResponse(response) {
  if (response.status >= 200 && response.status < 300) {
    return response;
  }

  const error = new ResponseError(response.statusText);
  error.response = response;
  throw error;
}

function replaceQuestions(questions) {
  return {
    type: 'REPLACE_QUESTIONS',
    questions,
  };
}

function replaceResponses(responses) {
  return {
    type: 'REPLACE_RESPONSES',
    responses,
  };
}

function replaceSession(session) {
  return {
    type: 'REPLACE_SESSION',
    session,
  };
}

function updateResponse(response) {
  return {
    type: 'UPDATE_RESPONSE',
    response,
  };
}

function receiveHome(json) {
  return dispatch => ({
    type: 'RECEIVE_HOME',
    session: dispatch(replaceSession(json.session)),
    questions: dispatch(replaceQuestions(json.questions)),
    responses: dispatch(replaceResponses(json.responses)),
  });
}

export function saveResponse(answerId) {
  return dispatch => fetch('/data', {
    credentials: 'same-origin',
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      answerId,
    }),
  })
    .then(checkResponse)
    .then(response => response.json())
    .then(json => dispatch(updateResponse(json)))
    .catch(error => {
      let errorMessage = 'That response could not be saved.';
      console.error(error);
      if (error instanceof ResponseError) {
        console.error(error.response);
      } else {
        errorMessage = 'The server could not be reached to save your ' +
          'response. Please check your internet connection and try again.';
      }

      alert(errorMessage);

      throw error;
    });
}

export function fetchHome() {
  return dispatch => fetch('/data', { credentials: 'same-origin' })
    .then(checkResponse)
    .then(response => response.json())
    .then(json => dispatch(receiveHome(json)))
    .catch(error => {
      let errorMessage = 'There was a problem loading the survey data ' +
        'from the server. Please try again later.';
      console.error(error);
      if (error instanceof ResponseError) {
        console.error(error.response);
      } else {
        errorMessage = 'The server could not be reached to load the ' +
          'survey. Please check your internet connection and try again.';
      }

      alert(errorMessage);

      throw error;
    });
}

export function pageLoaded() {
  return dispatch => dispatch({ type: 'PAGE_LOADED' });
}
