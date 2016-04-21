import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import Home from './components/Home';
import configureStore from './stores/home';
import injectTapEventPlugin from 'react-tap-event-plugin';

// Needed for onTouchTap
// Can go away when react 1.0 release
// Check this repo:
// https://github.com/zilverline/react-tap-event-plugin
injectTapEventPlugin();

const store = configureStore({
  pageLoading: true,
  questions: [],
  responses: [],
  session: '',
});

render(
  <Provider store={store}>
    <Home />
  </Provider>,
  document.getElementById('root')
);
