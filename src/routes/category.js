import { v4 as uuidv4 } from 'uuid';
import { Router } from 'express';

const router = Router();

router.get('/', (req, res) => {
    return res.send(Object.values(req.context.models.categories));
});

router.get('/:categoryId', (req, res) => {
    return res.send(req.context.models.categories[req.params.categoryId]);
});

router.get('/:categoryId/contributor/:contributorId', (req, res) => {
    return res.send(req.context.models.categories[req.params.categoryId].contributors.find(contributor => contributor.id === req.params.contributorId));
});

router.get('/scope/:scopeId', (req, res) => {
    return res.send(req.params.scopeId);
});

router.post('/', (req, res) => {
    const id = uuidv4();
    req.context.models.categories[id] = (req.body.category);

    return res.send(category);
});

export default router;