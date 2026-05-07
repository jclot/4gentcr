const { Router } = require('express');
const { validate } = require('../middleware/validate');
const { loginSchema, registerSchema } = require('../schemas');
const { login, register } = require('../controllers/authController');

const router = Router();

router.post('/login', validate(loginSchema), login);
router.post('/register', validate(registerSchema), register);

module.exports = router;