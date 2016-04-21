import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import Admin from './components/admin';
import configureStore from './stores/admin';
import injectTapEventPlugin from 'react-tap-event-plugin';

// We load this bundle on the login page so it's already cached once
// the user signs in. This conditional prevents it from running there.
if (document.getElementById('root')) {
  // Needed for onTouchTap
  // Can go away when react 1.0 release
  // Check this repo:
  // https://github.com/zilverline/react-tap-event-plugin
  injectTapEventPlugin();

  const store = configureStore({
    pageLoading: true,
    currentUser: '',
    users: [],
    questions: [],
    answers: [],
    responses: [],
  });

  render(
    <Provider store={store}>
      <Admin />
    </Provider>,
    document.getElementById('root')
  );
}
