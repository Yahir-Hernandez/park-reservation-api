import { Router } from 'express';
import { AuthController } from '@/controllers/auth.controller';
import { validate } from '@/middlewares/validate.middleware'
import {
  registerUserSchema,
  loginUserSchema
} from '@/schemas/auth.schema';


const router = Router();

router.post('/register', validate(registerUserSchema), AuthController.register);
router.post('/login', validate(loginUserSchema), AuthController.login);

export default router;
