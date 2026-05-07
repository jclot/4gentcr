const { Router } = require('express');
const { authenticate } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { updateUserSchema } = require('../schemas');
const { updateUser } = require('../controllers/usersController');

const router = Router();

router.put('/:id', authenticate, validate(updateUserSchema), updateUser);

module.exports = router;