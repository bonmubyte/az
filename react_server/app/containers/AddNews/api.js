import axios from '../../utils/http';
axios.defaults.timeout = 180000;
export const addPost = payload => axios.post('api/post/', payload);
