const { Router } = require('express');
const { authenticate } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { addPostSchema } = require('../schemas');
const { addPost, likePost } = require('../controllers/communityController');

const router = Router();

router.use(authenticate);

router.post('/', validate(addPostSchema), addPost);
router.put('/:id/like', likePost);

module.exports = router;