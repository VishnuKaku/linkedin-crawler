const { validationResult } = require('express-validator');

/**
 * Middleware to handle validation results.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 */
const validate = (req, res, next) => {
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
        const formattedErrors = errors.array().map(err => ({
            msg: err.msg,
            param: err.param,
            location: err.location || 'body',
        }));

        return res.status(400).json({
            status: 'error',
            message: 'Validation failed',
            errors: formattedErrors,
        });
    }
    
    next();
};

module.exports = validate;
