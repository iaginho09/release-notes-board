// Forwards /api calls to the backend during `ng serve`.
// Override the target with the API_URL environment variable, e.g. API_URL=http://localhost:9090.
module.exports = {
  '/api': {
    target: process.env.API_URL ?? 'http://localhost:8080',
    secure: false,
    changeOrigin: true,
  },
};
