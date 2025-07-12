const errorHandlers = (error, req, res, next) => {
    console.error('ERROR CAUGHT BY MIDDLEWARE:');
    console.error('URL:', req.method, req.url);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('Error details:', error);
    
    res.status(error.statusCode || 500).json({
        message: error.message || 'server error',
        error: process.env.NODE_ENV === 'development' ? error.stack : 'Internal server error'
    });
};

module.exports = errorHandlers;