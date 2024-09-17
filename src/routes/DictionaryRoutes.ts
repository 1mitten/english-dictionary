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
router.get('/resourceData', dictionaryController.resourceData);
router.get('/getRandomWords/:count', dictionaryController.getRandomWords);
router.get('/getMetrics', dictionaryController.getMetrics);

router.get('/exportToJson', dictionaryController.exportToJson);

router.post('/findWordsByTags', dictionaryController.findWordsByTags);
router.post('/findMany', dictionaryController.findMany);
router.post('/filter', dictionaryController.filter);

export default router;
