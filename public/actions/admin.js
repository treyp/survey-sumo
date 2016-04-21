require('es6-promise').polyfill();
import fetch from 'isomorphic-fetch';
import ResponseError from './ResponseError';

function checkResponse(response) {
  if (response.status >= 200 && response.status < 300) {
    return response;
  } else if (response.status === 401) {
    window.location = '/admin/login?loggedout';
  }

  const error = new ResponseError(response.statusText);
  error.response = response;
  throw error;
}

function fetchAndDispatch(endpoint, body, actionCreator, errorMessage, method = 'POST') {
  return dispatch => {
    const fetchOptions = {
      credentials: 'same-origin',
    };
    if (method !== 'GET') {
      fetchOptions.method = method;
      fetchOptions.headers = {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      };
    }

    if (body) {
      fetchOptions.body = JSON.stringify(body);
    }

    return fetch(endpoint, fetchOptions)
    .then(checkResponse)
    .then(response => response.json())
    .then(json => dispatch(actionCreator(json)))
    .catch(error => {
      console.error(error);
      if (error instanceof ResponseError) {
        console.error(error.response);
      }

      if (errorMessage) {
        alert(errorMessage);
      }

      throw error;
    });
  };
}

// Returns an object with CRUD actions for an object type.
// The actions generated will have the types 'REPLACE_{type}S',
// 'CREATE_{type}', 'UPDATE_{type}', and 'DELETE_{type}'.
// Endpoint: endpoint to hit. Will send POST requests with JSON options. The
//   option 'action' will be 'create', 'read', 'update', or 'delete'.
// Type: an all-lowercase string describing the type of object we're generating
//   actions for.
function crudActionGenerator(endpoint, type, primaryKey = 'id') {
  const creators = {
    create: obj => ({
      type: `CREATE_${type.toUpperCase()}`,
      [type]: obj,
    }),

    readAll: obj => ({
      type: `REPLACE_${type.toUpperCase()}S`,
      [`${type}s`]: obj,
    }),

    update: obj => ({
      type: `UPDATE_${type.toUpperCase()}`,
      [type]: obj,
    }),

    delete: id => response => {
      if (!response.success) {
        throw new Error(response);
      }

      return {
        type: `DELETE_${type.toUpperCase()}`,
        [primaryKey]: id,
      };
    },
  };

  return {
    create: obj => fetchAndDispatch(
      endpoint,
      Object.assign({
        action: 'create',
      }, obj),
      creators.create,
      `There was a problem creating that ${type.toLowerCase()}`),

    readAll: creators.readAll,

    update: (obj, id = obj[primaryKey]) => fetchAndDispatch(
      endpoint,
      Object.assign({
        action: 'update',
        [`original${primaryKey[0].toUpperCase()}${primaryKey.slice(1)}`]: id,
      }, obj),
      creators.update,
      `There was a problem updating that ${type.toLowerCase()}`),

    delete: id => fetchAndDispatch(
      endpoint,
      {
        action: 'delete',
        [primaryKey]: id,
      },
      creators.delete(id),
      `There was a problem deleting that ${type.toLowerCase()}`),
  };
}

const questionActions = crudActionGenerator('/admin/questions', 'question');
const [createQuestion, replaceQuestions, updateQuestion, deleteQuestion] = [
  questionActions.create,
  questionActions.readAll,
  questionActions.update,
  questionActions.delete,
];
export { createQuestion, updateQuestion, deleteQuestion };

const answerActions = crudActionGenerator('/admin/answers', 'answer');
const [createAnswer, replaceAnswers, updateAnswer, deleteAnswer] = [
  answerActions.create,
  answerActions.readAll,
  answerActions.update,
  answerActions.delete,
];
export { createAnswer, updateAnswer, deleteAnswer };

function replaceResponses(responses) {
  return {
    type: 'REPLACE_RESPONSES',
    responses,
  };
}

export function fetchResponses() {
  return fetchAndDispatch(
    '/admin/responses',
    null,
    replaceResponses,
    null,
    'GET');
}

const userActions = crudActionGenerator('/admin/users', 'user', 'email');
const [createUser, updateUser, deleteUser] = [
  userActions.create,
  userActions.update,
  userActions.delete,
];
export { createUser, updateUser, deleteUser };

// reading is a little different for the User model
// because it has its own endpoint and returns the currentUser as well

function replaceUsers(users) {
  return Object.assign({
    type: 'REPLACE_USERS',
  }, users);
}

export function fetchUsers() {
  return fetchAndDispatch(
    '/admin/users',
    { action: 'read' },
    replaceUsers,
    'The current list of users could not be retrieved');
}

function receiveSurvey(survey) {
  return dispatch => ({
    type: 'RECEIVE_SURVEY',
    questions: dispatch(replaceQuestions(survey.questions)),
    answers: dispatch(replaceAnswers(survey.answers)),
    responses: dispatch(replaceResponses(survey.responses)),
  });
}

export function fetchSurvey() {
  return fetchAndDispatch(
    '/admin/survey',
    null,
    receiveSurvey,
    'The survey data could not be retrieved',
    'GET');
}

export function pageLoaded() {
  return dispatch => dispatch({ type: 'PAGE_LOADED' });
}
