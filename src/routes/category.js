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

    if (categories) {
        return res.send(categories);
    }

    // if category isn't found, return 404; also returns 404 if category exists but not authorized
    res.status(404);
    res.send(`Category with id: ${req.params.categoryId} not found`);
});

router.get('/:categoryId/totalOutput', async (req, res, next) => {
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

    // if category isn't found, return 404; also returns 404 if category exists but not authorized
    if (!categories) {
        res.status(404);
        return res.send(`Category with id: ${req.params.categoryId} not found`);
    } else {

        // checks if any contributors exist, if sum() finds nothing on where, it returns null
        if (!(await req.context.models.Contributor.findOne({
            where: {
                [Op.and]: [
                    { userId: req.context.me.id },
                    { categoryId: req.params.categoryId }
                ]
            }
        }).catch(next))) {
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

            return res.send({ total: sum });
        }
    }
});

router.get('/:categoryId/contributor/', async (req, res, next) => {

    // checks if category exists and is accessible, if not return 404
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
        res.status(404);
        return res.send(`Category with id: ${req.params.categoryId} not found`);
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

router.put('/:categoryId', async (req,res, next) => {
    const exists = await req.context.models.Category.findOne({
        where: {
            [Op.and]: [
                { userId: req.context.me.id },
                { id: req.params.categoryId }
            ]   
        }
    });

    if (!exists) {
        res.status(404);
        return res.send(`Category with id: ${req.params.categoryId} not found.`);
    }

    const category = await req.context.models.Category.update({
        name: req.body.name,
        scope: req.body.scope,
        direction: req.body.direction,
        type: req.body.type,
    },
    {
        where: {
            id: req.params.categoryId
        }
    }).catch(next);

    return res.send(await req.context.models.Category.findByPk(req.params.categoryId));
});

router.delete('/:categoryId', async (req, res, next) => {
    const toDelete = await req.context.models.Category.findByPk(req.params.categoryId).catch(next);

    // check if category exists and belongs to user sending delete request, delete if it does
    if (toDelete && toDelete.dataValues.userId === req.context.me.id) {
        const result = await req.context.models.Category.destroy({
            where: { id: req.params.categoryId },
        }).catch(next);

        return res.send(`Category ${req.params.categoryId} deleted`);
    }
    
    res.status(404);
    return res.send(`Category with id: ${req.params.categoryId} not found`);    
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

router.put('/contributor/:contributorId', async (req,res, next) => {
    const exists = await req.context.models.Contributor.findOne({
        where: {
            [Op.and]: [
                { userId: req.context.me.id },
                { id: req.params.contributorId }
            ]   
        }
    });

    if (!exists) {
        res.status(404);
        return res.send(`Contributor with id: ${req.params.contributorId} not found.`);
    }

    const contributor = await req.context.models.Contributor.update({
        name: req.body.name,
        carbonProduction: req.body.carbonProduction,
    },
    {
        where: {
            id: req.params.contributorId
        }
    }).catch(next);

    return res.send(await req.context.models.Contributor.findByPk(req.params.contributorId));
});

router.delete('/contributor/:contributorId', async (req, res, next) => {
    const toDelete = await req.context.models.Contributor.findByPk(req.params.contributorId).catch(next);

    // check if contributor exists and belongs to user sending delete request, delete if it does
    if (toDelete && toDelete.dataValues.userId === req.context.me.id) {
        const result = await req.context.models.Contributor.destroy({
            where: { id: req.params.contributorId },
        }).catch(next);

        return res.send(`Contributor ${req.params.contributorId} deleted`);
    }
    
    res.status(404);
    return res.send(`Contributor with id: ${req.params.contributorId} not found`);   
});


export default router;