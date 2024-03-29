/*
 *
 * AddPostFromResource actions
 *
 */

import * as c from './actionTypes';

export function defaultAction() {
  return {
    type: c.DEFAULT_ACTION,
  };
}
export function addPost(payload) {
  return {
    type: c.ADD_POST,
    payload,
  };
}
export function setResponse(payload) {
  return {
    type: c.SET_RESPONSE,
    payload,
  };
}

export function resetResponse() {
  return {
    type: c.RESET_RESPONSE,
  };
}
