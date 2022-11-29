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

router.get('/:categoryId/contributor/', async (req, res) => {

    // checks if category exists and is accessible, if not return null
    if (!await req.context.models.Category.findOne({where: {
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
    }})) {
        return res.send(null);
    }

    // gets all contributors in the category
    const contributors = await req.context.models.Contributor.findAll({
        where: {
            [Op.and]: [
                { categoryId: req.params.categoryId },
                { userId: req.context.me.id },
            ]
        }
    });

    return res.send(contributors);
});

router.get('/scope/:scopeId', async (req, res) => {
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
                    scope: req.params.scopeId,
                },
            ]
        }
    });
    return res.send(categories);
});

router.post('/', async (req, res) => {
    const category = await req.context.models.Category.create({
        name: req.body.name,
        scope: req.body.scope,
        direction: req.body.direction,
        type: req.body.type,
        userId: req.context.me.id,
    });

    return res.send(category);
});

router.delete('/:categoryId', async (req, res) => {
    const toDelete = await req.context.models.Category.findByPk(req.params.categoryId);

    // check if category belongs to user sending delete request, delete if it does
    if (toDelete.dataValues.userId === req.context.me.id) {
        const result = await req.context.models.Category.destroy({
            where: { id: req.params.categoryId },
        });

        return res.send(true);
    }
    
    // return 401 error if invalid category
    return res.send(401, 'Category not authorized');
});

router.post('/contributor', async (req, res) => {
    const contributor = await req.context.models.Contributor.create({
        name: req.body.name,
        carbonProduction: req.body.bodyProduction,
        categoryId: req.body.categoryId,
        userId: req.context.me.id,
    });

    return res.send(contributor);
});

router.delete('/contributor/:contributorId', async (req, res) => {
    const toDelete = await req.context.models.Contributor.findByPk(req.params.contributorId);

    // check if contributor belongs to user sending delete request, delete if it does
    if (toDelete.dataValues.userId === req.context.me.id) {
        const result = await req.context.models.Contributor.destroy({
            where: { id: req.params.categoryId },
        });

        return res.send(true);
    }
    
    // return 401 error if invalid contributor
    return res.send(401, 'Contributor not authorized');
});


export default router;