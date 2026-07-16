export const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  if (err.status === 401) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (err.status === 403) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error'
  });
};
