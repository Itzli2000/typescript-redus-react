import { Action } from 'redux';
import { ThunkAction } from 'redux-thunk';
import { RooState } from './store';

export interface UserEvent {
  id: number;
  title: string;
  dateStart: string;
  dateEnd: string;
}

interface UserEventsState {
  byIds: Record<UserEvent['id'], UserEvent>;
  allIds: UserEvent['id'][];
}

const LOAD_REQUEST = 'userEvents/load_request';

interface LoadRequestAction extends Action<typeof LOAD_REQUEST> {}

const LOAD_SUCCESS = 'userEvents/load_success';

interface LoadSuccessAction extends Action<typeof LOAD_SUCCESS> {
  payload: {
    events: UserEvent[]
  }
}

const LOAD_FAILURE = 'userEvents/load_failure';

interface LoadFailureAction extends Action<typeof LOAD_FAILURE> {
  error: string;
}

export const loadUserEvents = (): ThunkAction<
void, RooState, undefined, LoadRequestAction | LoadSuccessAction | LoadFailureAction
// eslint-disable-next-line no-unused-vars
> => async (dispatch, getState) => {
  dispatch({
    type: LOAD_REQUEST,
  });

  try {
    const response = await fetch('http://localhost:3001/events');
    const events: UserEvent[] = await response.json();

    dispatch({
      type: LOAD_SUCCESS,
      payload: { events },
    });
  } catch (error) {
    dispatch({
      type: LOAD_FAILURE,
      error: 'Failed to load events.',
    });
  }
};

const selectUserEventsState = (rootState: RooState) => rootState.userEvents;

export const selectUserEventsArray = (rootState: RooState) => {
  const state = selectUserEventsState(rootState);
  return state.allIds.map((id) => state.byIds[id]);
};

const initialState: UserEventsState = {
  byIds: {},
  allIds: [],
};

const userEventsReducer = (state: UserEventsState = initialState, action: LoadSuccessAction) => {
  switch (action.type) {
    case LOAD_SUCCESS:
      // eslint-disable-next-line no-case-declarations
      const { events } = action.payload;
      return {
        ...state,
        allIds: events.map(({ id }) => id),
        byIds: events.reduce<UserEventsState['byIds']>((byIds, event) => {
          // eslint-disable-next-line no-param-reassign
          byIds[event.id] = event;
          return byIds;
        }, {}),
      };

    default:
      return state;
  }
};

export default userEventsReducer;
