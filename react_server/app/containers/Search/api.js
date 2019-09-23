import axios from '../../utils/http';
const qs = require('querystring');
axios.defaults.timeout = 180000;
const config = {
  headers: {
    'Content-Type': 'multipart/form-data',
  },
};
export const addPost = payload => {
  const formData = new FormData();
  // formData.append('file_txt', payload.file_txt);
  // formData.append('url_path', payload.url_path);
  formData.append('email', payload.query);
  return axios.post('api/generate_graph/', formData, config);
};
