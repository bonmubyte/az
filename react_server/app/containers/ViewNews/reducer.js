/*
 *
 * ViewNews reducer
 *
 */

import { fromJS } from 'immutable';
import * as c from './constants';

export const initialState = fromJS({
  loading: true,
  post: {},
  comments: [],
  postReactions: [],
});

function viewNewsReducer(state = initialState, action) {
  switch (action.type) {
    case c.DEFAULT_ACTION:
      return state;
    case c.VIEW_POST:
      return state.set('loading', true);
    case c.SET_POST:
      return state.set('post', action.payload).set('loading', false);
    case c.SET_POST_COMMENTS:
      return state.set('comments', action.payload);
    case c.SAVE_POST_REACTIONS:
      return state.set('postReactions', action.payload);
    case c.UNMOUNT_REDUX:
      return state.set('post', {});

    default:
      return state;
  }
}

export default viewNewsReducer;
