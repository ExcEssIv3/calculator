import { v4 as uuidv4 } from 'uuid';
import { Op } from 'sequelize';
import { Router } from 'express';

const router = Router();

router.get('/', async (req, res) => {
    const categories = await req.context.models.Category.findAll({
        where: {
            [Op.or]: [
                { userId: 1 },
                { userId: req.context.me.id }
            ],
        },
    });
    return res.send(categories);
});

router.get('/:categoryId', async (req, res) => {
    const categories = await req.context.models.Category.findOne({
        where: {
            [Op.and]: [
                {
                    [Op.or]: [
                        { userId: 1 },
                        { userId: req.context.me.id }
                    ],
                },
                {
                    id: req.params.categoryId,
                },
            ]
        }
    });
    return res.send(categories);
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