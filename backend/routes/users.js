const { Router } = require('express');
const { authenticate } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { updateUserSchema, changePasswordSchema } = require('../schemas');
const { updateUser, changePassword, deleteUser } = require('../controllers/usersController');

const router = Router();

router.put('/:id', authenticate, validate(updateUserSchema), updateUser);
router.put('/:id/password', authenticate, validate(changePasswordSchema), changePassword);
router.delete('/:id', authenticate, deleteUser);

module.exports = router;
