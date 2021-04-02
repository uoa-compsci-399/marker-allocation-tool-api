import app from './app';

// Server port
const HTTP_PORT = 8000;
// Start server
app.listen(HTTP_PORT, () => {
  console.log(`Server is running on port${HTTP_PORT}`);
});
