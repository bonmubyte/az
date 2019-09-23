import { createSelector } from 'reselect';
import { initialState } from './reducer';

/**
 * Direct selector to the addPostFromResource state domain
 */

const selectAddPostFromResourceDomain = (state) =>
  state.get('addPostFromResource', initialState);

/**
 * Other specific selectors
 */

/**
 * Default selector used by AddNews
 */

const makeSelectPostFromResource = () =>
  createSelector(selectAddPostFromResourceDomain, (substate) =>
    substate.toJS(),
  );

export default makeSelectPostFromResource;
export { selectAddPostFromResourceDomain };
