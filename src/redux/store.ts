import {
  applyMiddleware, combineReducers, compose, createStore,
} from 'redux';
import thunk from 'redux-thunk';
import recorderReducer from './recorder';
import userEventsReducer from './user-events';

// eslint-disable-next-line dot-notation
const composeEnhancers = (window && window as any)['__REDUX_DEVTOOLS_EXTENSION_COMPOSE__'] || compose;

const rootReducer = combineReducers({
  userEvents: userEventsReducer,
  recorder: recorderReducer,
});

export type RooState = ReturnType<typeof rootReducer>;

const store = createStore(
  rootReducer,
  {},
  composeEnhancers(applyMiddleware(thunk)),
);

export default store;
