/* eslint-disable no-case-declarations */
import { Action } from 'redux';
import { ThunkAction } from 'redux-thunk';
import { selectDateStart } from './recorder';
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

const CREATE_REQUEST = 'userEvents/create_request';
const CREATE_SUCCESS = 'userEvents/create_success';

interface CreateRequestAction extends Action<typeof CREATE_REQUEST> {}
interface CreateSuccessAction extends Action<typeof CREATE_SUCCESS> {
  payload: {
    event: UserEvent;
  }
}

const CREATE_FAILURE = 'userEvents/create_failure';

interface CreateFailureAction extends Action<typeof CREATE_FAILURE> {}

export const createUserEvent = (): ThunkAction<
Promise<void>,
RooState,
undefined,
CreateRequestAction | CreateSuccessAction | CreateFailureAction
> => async (dispatch, getState) => {
  dispatch({
    type: CREATE_REQUEST,
  });

  try {
    const dateStart = selectDateStart(getState());
    const event: Omit<UserEvent, 'id'> = {
      title: 'No name',
      dateStart,
      dateEnd: new Date().toISOString(),
    };
    const response = await fetch('http://localhost:3001/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(event),
    });

    const createdEvent: UserEvent = await response.json();

    dispatch({
      type: CREATE_SUCCESS,
      payload: {
        event: createdEvent,
      },
    });
  } catch (error) {
    dispatch({
      type: CREATE_FAILURE,
    });
  }
};

const DELETE_REQUEST = 'userEvents/delete_request';

interface DelteRequestAction extends Action<typeof DELETE_REQUEST> {}

const DELETE_FAILURE = 'userEvents/delete_failure';

interface DelteFailureAction extends Action<typeof DELETE_FAILURE> {}

const DELETE_SUCCESS = 'userEvents/delete_success';

interface DelteSuccessAction extends Action<typeof DELETE_SUCCESS> {
  payload: { id: UserEvent['id']}
}

export const deleteUserEvent = (id: UserEvent['id']): ThunkAction<
Promise<void>,
RooState,
undefined,
DelteRequestAction | DelteSuccessAction | DelteFailureAction
> => async (dispatch) => {
  dispatch({
    type: DELETE_REQUEST,
  });

  try {
    const response = await fetch(`http://localhost:3001/events/${id}`, {
      method: 'DELETE',
    });
    if (response.ok) {
      dispatch({
        type: DELETE_SUCCESS,
        payload: { id },
      });
    }
  } catch (error) {
    dispatch({
      type: DELETE_FAILURE,
    });
  }
};

const UPDATE_REQUERST = 'userEvents/update_request';
const UPDATE_SUCCESS = 'userEvents/update_success';
const UPDATE_FAILURE = 'userEvents/update_failure';

interface UpdateRequestAction extends Action<typeof UPDATE_REQUERST> {}
interface UpdateFailureAction extends Action<typeof UPDATE_FAILURE> {}
interface UpdateSuccessAction extends Action<typeof UPDATE_SUCCESS> {
  payload: {event: UserEvent}
}

export const updateUserEvent = (event: UserEvent): ThunkAction<
Promise<void>,
RooState,
undefined,
UpdateRequestAction | UpdateSuccessAction | UpdateFailureAction
> => async (dispatch) => {
  dispatch({
    type: UPDATE_REQUERST,
  });

  try {
    const response = await fetch(`http://localhost:3001/events/${event.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(event),
    });

    const updatedEvent: UserEvent = await response.json();

    dispatch({
      type: UPDATE_SUCCESS,
      payload: { event: updatedEvent },
    });
  } catch (error) {
    dispatch({
      type: UPDATE_FAILURE,
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

const userEventsReducer = (
  state: UserEventsState = initialState,
  action: LoadSuccessAction | CreateSuccessAction | DelteSuccessAction | UpdateSuccessAction,
) => {
  switch (action.type) {
    case LOAD_SUCCESS:
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

    case CREATE_SUCCESS:
      const { event } = action.payload;
      return {
        ...state,
        allIds: [...state.allIds, event.id],
        byIds: { ...state.byIds, [event.id]: event },
      };

    case DELETE_SUCCESS:
      const { id } = action.payload;
      const newState = {
        ...state,
        byIds: { ...state.byIds },
        allIds: state.allIds.filter((storeId) => storeId !== id),
      };
      delete newState.byIds[id];
      return newState;

    case UPDATE_SUCCESS:
      const { event: updatedEvent } = action.payload;
      return {
        ...state,
        byIds: { ...state.byIds, [updatedEvent.id]: updatedEvent },
      };

    default:
      return state;
  }
};

export default userEventsReducer;
