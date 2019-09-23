/*
 *
 * AddNews reducer
 *
 */

import { fromJS } from 'immutable';
import * as c from './actionTypes';

export const initialState = fromJS({
  loading: false,
  response: {},
});

function addPostFromResourceReducer(state = initialState, action) {
  switch (action.type) {
    case c.DEFAULT_ACTION:
      return state;
    case c.ADD_POST:
      return state.set('loading', true);
    case c.SET_RESPONSE:
      return state.set('response', action.payload).set('loading', false);
    case c.RESET_RESPONSE:
      return state.set('response', {}).set('loading', false);
    default:
      return state;
  }
}

export default addPostFromResourceReducer;
