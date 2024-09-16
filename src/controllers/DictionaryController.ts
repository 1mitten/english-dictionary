
// src/controllers/dictionaryController.ts
import { Request, Response } from 'express';
import { Dictionary } from '../Dictionary'


const dictionary = new Dictionary();

export class DictionaryController {
    async find(req: Request, res: Response): Promise<void> {
        try {
            const { word } = req.params;
            const result = await dictionary.find(word);
            console.log(result);
            res.json(result);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    async findByPrefix(req: Request, res: Response): Promise<void> {
        try {
            const { prefix } = req.params;
            const result = await dictionary.findByPrefix(prefix);
            res.json(result);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    async findBySuffix(req: Request, res: Response): Promise<void> {
        try {
            const { suffix } = req.params;
            const result = await dictionary.findBySuffix(suffix);
            res.json(result);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    async findBySubstring(req: Request, res: Response): Promise<void> {
        try {
            const { substring } = req.params;
            const result = await dictionary.findBySubstring(substring);
            res.json(result);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    async findByDescription(req: Request, res: Response): Promise<void> {
        try {
            const { text } = req.params;
            const result = await dictionary.findByDescription(text);
            res.json(result);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    async findByWordLengthRange(req: Request, res: Response): Promise<void> {
        try {
            const { min, max } = req.params;
            const result = await dictionary.findByWordLengthRange(Number(min), Number(max));
            res.json(result);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    async findWordsByTags(req: Request, res: Response): Promise<void> {
        console.log(req.body)
        try {
            const { tags, matchAll } = req.body;
            const result = await dictionary.findWordsByTags(tags, Boolean(matchAll));
            res.json(result);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    async findMany(req: Request, res: Response): Promise<void> {
        try {
            const { words } = req.body;
            const result = await dictionary.findMany(words);
            res.json(result);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    async getRandomWords(req: Request, res: Response): Promise<void> {
        try {
            const { count } = req.params;
            const result = await dictionary.getRandomWords(Number(count));
            res.json(result);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    async filter(req: Request, res: Response): Promise<void> {
        try {
            const { regex } = req.body;
            const result = await dictionary.filter(new RegExp(regex));
            res.json(result);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }
}
