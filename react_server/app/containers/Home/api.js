import get from 'lodash';
import axios from '../../utils/http';

export const fetchPosts = (payload) => axios.get(`api/get_home_posts/`);

export const fetchUser = (email) => axios.get(`api/user/?email=${email}`);
