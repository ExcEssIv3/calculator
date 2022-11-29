import { v4 as uuidv4 } from 'uuid';
import { Op } from 'sequelize';
import { Router } from 'express';

const router = Router();

router.get('/', async (req, res, next) => {
    const categories = await req.context.models.Category.findAll({
        where: {
            [Op.or]: [
                { userId: 1 },
                { userId: req.context.me.id }
            ],
        },
    }).catch(next);
    return res.send(categories);
});

router.get('/:categoryId', async (req, res, next) => {
    console.log('GET');
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
    }).catch(next);
    return res.send(categories);
});

router.get('/:categoryId/totalOutput', async (req, res, next) => {
    if (req.params.categoryId === 'null') {
        return res.send({ total: 0 });
    } else {
        const sum = await req.context.models.Contributor.sum('carbonProduction', {
            where: {
                [Op.and]: [
                    { userId: req.context.me.id },
                    { categoryId: req.params.categoryId }
                ]
            }
        }).catch(next);

        return res.send({ total: (sum === null) ? 0 : sum });
    }
});

router.get('/:categoryId/contributor/', async (req, res, next) => {

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
    }}).catch(next)) {
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
    }).catch(next);

    return res.send(contributors);
});

router.get('/scope/:scopeId', async (req, res, next) => {
    const categories = await req.context.models.Category.findAll({
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
    }).catch(next);
    return res.send(categories);
});

router.post('/', async (req, res, next) => {
    const category = await req.context.models.Category.create({
        name: req.body.name,
        scope: req.body.scope,
        direction: req.body.direction,
        type: req.body.type,
        userId: req.context.me.id,
    }).catch(next);

    return res.send(category);
});

router.delete('/:categoryId', async (req, res, next) => {
    const toDelete = await req.context.models.Category.findByPk(req.params.categoryId).catch(next);

    // check if category belongs to user sending delete request, delete if it does
    if (toDelete.dataValues.userId === req.context.me.id) {
        const result = await req.context.models.Category.destroy({
            where: { id: req.params.categoryId },
        }).catch(next);

        return res.send(true);
    }
    
    // return 401 error if invalid category
    return res.send(401, 'Category not authorized');
});

router.post('/contributor', async (req, res, next) => {
    const contributor = await req.context.models.Contributor.create({
        name: req.body.name,
        carbonProduction: req.body.carbonProduction,
        categoryId: req.body.categoryId,
        userId: req.context.me.id,
    }).catch(next);

    return res.send(contributor);
});

// router.put('/contributor/:contributorId/totalOutput/:totalOutput', async (req, res, next) => {
    
// })

router.delete('/contributor/:contributorId', async (req, res, next) => {
    const toDelete = await req.context.models.Contributor.findByPk(req.params.contributorId).catch(next);

    // check if contributor belongs to user sending delete request, delete if it does
    if (toDelete.dataValues.userId === req.context.me.id) {
        const result = await req.context.models.Contributor.destroy({
            where: { id: req.params.categoryId },
        }).catch(next);

        return res.send(true);
    }
    
    // return 401 error if invalid contributor
    return res.send(401, 'Contributor not authorized');
});


export default router;