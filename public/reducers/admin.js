import { combineReducers } from 'redux';

function pageLoading(state = [], action) {
  if (action.type === 'PAGE_LOADED') {
    return false;
  }

  return state;
}

function users(state = [], action) {
  switch (action.type) {
    case 'REPLACE_USERS':
      return action.users;
    case 'CREATE_USER':
      return [
        ...state,
        action.user,
      ];
    case 'UPDATE_USER':
      return state.map(u => {
        if (u.email === action.user.originalEmail) {
          return { email: action.user.email };
        }

        return u;
      });
    case 'DELETE_USER':
      return state.filter(u => u.email !== action.email);
    default:
      return state;
  }
}

function currentUser(state = '', action) {
  if (action.type === 'REPLACE_USERS') {
    return action.currentUser;
  }

  return state;
}

function questions(state = [], action) {
  switch (action.type) {
    case 'REPLACE_QUESTIONS':
      return action.questions;
    case 'CREATE_QUESTION':
      return [
        ...state,
        action.question,
      ];
    case 'UPDATE_QUESTION':
      return state.map(q => {
        if (q.id === action.question.id) {
          return action.question;
        }

        return q;
      });
    case 'DELETE_QUESTION':
      return state.filter(q => q.id !== action.id);
    default:
      return state;
  }
}

function answers(state = [], action) {
  switch (action.type) {
    case 'REPLACE_ANSWERS':
      return action.answers;
    case 'CREATE_ANSWER':
      return [
        ...state,
        action.answer,
      ];
    case 'UPDATE_ANSWER':
      return state.map(a => {
        if (a.id === action.answer.id) {
          return action.answer;
        }

        return a;
      });
    case 'DELETE_QUESTION':
      return state.filter(a => a.QuestionId !== action.id);
    case 'DELETE_ANSWER':
      return state.filter(a => a.id !== action.id);
    default:
      return state;
  }
}

function responses(state = [], action) {
  switch (action.type) {
    case 'DELETE_ANSWER':
      return state.filter(r => r.AnswerId !== action.id);
    case 'DELETE_QUESTION':
      return state.filter(r => r.QuestionId !== action.id);
    case 'REPLACE_RESPONSES':
      return action.responses;
    default:
      return state;
  }
}

const rootReducer = combineReducers({
  pageLoading,
  currentUser,
  users,
  questions,
  answers,
  responses,
});

export default rootReducer;
