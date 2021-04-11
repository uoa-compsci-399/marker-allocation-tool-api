import app from './app';

// Server port
const HTTP_PORT = parseInt(process.env.PORT || '') || 8000;

// Start server
app.listen(HTTP_PORT, () => {
  console.info(`Server is running on http://localhost:${HTTP_PORT}`);
});
