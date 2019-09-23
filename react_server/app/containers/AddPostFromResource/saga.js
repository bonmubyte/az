import { push } from 'connected-react-router';
import { takeLatest, call, put, select } from 'redux-saga/effects';
import * as c from './actionTypes';
import * as a from './actions';
import * as appActions from '../App/actions';
import * as api from './api';
import history from '../../utils/history';

export function* create(action) {
  try {
    const { payload } = action;
    const response = yield call(api.addPost, payload);
    if (response.status === 200) {
      console.log('response.status === 201');
      yield put(appActions.setResourceResponse(response.data));
      console.log(response.data + '  response date');
      console.log('response.status === 202');
      setTimeout(function() {
        //Put All Your Code Here, Which You Want To Execute After Some Delay Time.
        // payload.push('/add-news');
        console.log('response.status === 204');
      }, 1000);
      console.log('response.status === 203');
    }
  } catch (error) {
    console.log('response.status === 401');
    console.log(error);
    console.log('response.status === 402');
    yield put(
      a.setResponse({
        message: error.response.data,
        status: error.response.status,
      }),
    );
    console.log('response.status === 403');
  }
}
// Individual exports for testing
export default function* addNewsSaga() {
  // See example in containers/HomePage/saga.js
  yield takeLatest(c.ADD_POST, create);
}
