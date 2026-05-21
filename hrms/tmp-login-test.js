const axios = require('axios');

(async () => {
  try {
    const response = await axios.post(
      'http://localhost:4000/api/auth/login',
      {
        email: 'arjun.sharma@acmepeople.com',
        password: 'Welcome@123',
        rememberMe: true,
        orgSlug: 'acme',
      },
      {
        headers: { 'x-org-slug': 'acme' },
        withCredentials: true,
      },
    );
    console.log('status', response.status);
    console.log(JSON.stringify(response.data, null, 2));
  } catch (error) {
    if (error.response) {
      console.error('status', error.response.status);
      console.error(JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('error', error.message);
    }
  }
})();
