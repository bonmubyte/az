import { takeLatest, call, put } from 'redux-saga/effects';
import { get } from 'lodash';
import * as api from './api';
import * as a from './actions';
import * as c from './constants';
export function* index(action) {
	try {
	} catch (error) {}
}

export function* updateProfile(action) {
	try {
		const res = yield call(api.updateProfile, action.payload);
		yield put(a.setResponse({ message: res.data, status: res.status }));
	} catch (e) {
		console.log(e.message);
	}
}
// Individual exports for testing
export function* fetchProfile(action) {
	try {
		const response = yield call(api.fetchProfile, action.payload);
		yield put(a.setProfile(get(response, 'data[0]', {})));
	} catch (e) {
		console.log(e.message);
	}
}
export function* deletePost(action) {
	try {
		const response = yield call(a.deletePost, payload);
	} catch (error) {}
}
// Individual exports for testing
export default function* newsPageSaga() {
	// See example in containers/HomePage/saga.js
	yield takeLatest(c.FETCH_POSTS, index);
	yield takeLatest(c.UPDATE_PROFILE, updateProfile);
	yield takeLatest(c.FETCH_PROFILE, fetchProfile);
}
