import { combineReducers } from 'redux';

function pageLoading(state = [], action) {
  if (action.type === 'PAGE_LOADED') {
    return false;
  }

  return state;
}

function session(state = null, action) {
  switch (action.type) {
    case 'REPLACE_SESSION':
      return action.session;
    default:
      return state;
  }
}

function questions(state = [], action) {
  switch (action.type) {
    case 'REPLACE_QUESTIONS':
      return action.questions;
    default:
      return state;
  }
}

function responses(state = [], action) {
  switch (action.type) {
    case 'REPLACE_RESPONSES':
      return action.responses;
    case 'UPDATE_RESPONSE':
      return [
        action.response,
        ...state.filter(r => r.QuestionId !== action.response.QuestionId),
      ].sort((a, b) => {
        if (a.updatedAt > b.updatedAt) {
          return -1;
        }

        if (a.updatedAt < b.updatedAt) {
          return 1;
        }

        return 0;
      });
    default:
      return state;
  }
}

const rootReducer = combineReducers({
  pageLoading,
  session,
  questions,
  responses,
});

export default rootReducer;
