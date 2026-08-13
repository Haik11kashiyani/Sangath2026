export const sanitize = (str) => {
  if (typeof str !== 'string') return str;
  return str
    .replace(/<[^>]*>?/gm, '') // Strip HTML tags
    .trim()
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
};

export const validateRequired = (fields) => {
  return (req, res, next) => {
    const missingFields = [];
    for (const field of fields) {
      if (req.body[field] === undefined || req.body[field] === null || req.body[field] === '') {
        missingFields.push(field);
      }
    }
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        error: 'Missing required fields',
        details: missingFields
      });
    }
    
    next();
  };
};

export const validateImageFile = (file) => {
  if (!file) {
    return { valid: false, error: 'No file provided' };
  }
  
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (!allowedMimeTypes.includes(file.mimetype)) {
    return { valid: false, error: 'Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.' };
  }
  
  const maxSize = parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024;
  if (file.size > maxSize) {
    return { valid: false, error: `File size exceeds limit of ${maxSize / (1024 * 1024)}MB` };
  }
  
  return { valid: true, error: null };
};
