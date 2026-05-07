const { Router } = require('express');
const { authenticate } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const {
  addPropertySchema,
  updatePropertyStatusSchema,
  updatePropertySchema,
} = require('../schemas');
const {
  getProperties,
  addProperty,
  updatePropertyStatus,
  updateProperty,
  deleteProperty,
} = require('../controllers/propertiesController');

const router = Router();

// Todas las rutas requieren autenticacion
router.use(authenticate);

router.get('/', getProperties);
router.post('/', validate(addPropertySchema), addProperty);
router.put('/:id/status', validate(updatePropertyStatusSchema), updatePropertyStatus);
router.put('/:id', validate(updatePropertySchema), updateProperty);
router.delete('/:id', deleteProperty);

module.exports = router;