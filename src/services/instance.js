/**Global imports */
import * as Axios from 'axios';
import * as HttpStatus from 'http-status-codes';

let accessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjMsImlhdCI6MTUxNDM2Njc0MCwiZXhwIjoxNTE0MzY4NTQwfQ._xPA24qhk_h9fkuxjhPrWyo4QXwofi8dTmSGbJMfKTg';
let refreshToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjMsImlhdCI6MTUxNDM2Njc0MCwiZXhwIjoxNTE0OTcxNTQwfQ.e5KDVWe44N6aThR4wZYtUSTrmln4aelRtuYcyPYH0tg';

let instance = Axios.create({ baseURL: 'http://127.0.0.1:8848/api/', timeout: 1000 });
// let instance = Axios.create({ baseURL: 'http://d7718283.ngrok.io/api/', timeout: 1000 });

export function getTokenHeader(type) {
  let token = accessToken;
  if (type === 'refreshToken') {
    token = refreshToken;
  }
  return {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  };
}

// Add a request interceptor
instance
  .interceptors
  .request
  .use(config => config, (error => Promise.reject(error)));

// Add a response interceptor
instance
  .interceptors
  .response
  .use(response => response, (error => {
    console.log('ss', typeof HttpStatus.UNAUTHORIZED);

    if (error.response.status === HttpStatus.UNAUTHORIZED && error.message !== 'Request failed with status code 401') {
      console.log('unauthorized');

      return instance
        .get('refresh', getTokenHeader('refreshToken'))
        .then(response => {
          if (response.status === HttpStatus.OK) {
            let config = Object.assign({}, error.config);
            accessToken = response.data['new access token'];
            console.log('response access token', accessToken);

            config.headers = getTokenHeader('accessToken').headers;
            return instance.request(config)
              .then(response => response)
              .catch(err => err);
          }
        })
        .catch(err => console.log('INVALID REFRESH TOKEN!'));

    }
    return Promise.reject(error);
  }));

export default instance;