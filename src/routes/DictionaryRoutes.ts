// src/routes/dictionaryRoutes.ts
import { Router } from 'express';
import { DictionaryController } from '../controllers/DictionaryController';


const router = Router();
const dictionaryController = new DictionaryController();

router.get('/find/:word', dictionaryController.find);
router.get('/findByPrefix/:prefix', dictionaryController.findByPrefix);
router.get('/findBySuffix/:suffix', dictionaryController.findBySuffix);
router.get('/findBySubstring/:substring', dictionaryController.findBySubstring);
router.get('/findByDescription/:text', dictionaryController.findByDescription);
router.get('/findByWordLengthRange/:min/:max', dictionaryController.findByWordLengthRange);
router.post('/findWordsByTags', dictionaryController.findWordsByTags);
router.post('/findMany', dictionaryController.findMany);
router.get('/getRandomWords/:count', dictionaryController.getRandomWords);
router.post('/filter', dictionaryController.filter);

export default router;
