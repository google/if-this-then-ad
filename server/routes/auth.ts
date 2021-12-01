import {Request, Response, Router} from 'express';
import { googleAuthCallBack, googleLogin } from '../controllers/AuthController';
const router = Router();

router.get('/auth/google', googleLogin); 
router.get('/auth/google/callback', googleAuthCallBack);