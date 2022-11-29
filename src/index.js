import 'dotenv/config';
import express from 'express';
import cors from 'cors';

import models, { sequelize } from './models/index.js';
import routes from './routes/index.js';

const app = express();
const eraseDatabaseOnSync = true;

const username = 'admin';

app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(async (req, res, next) => { // pseudo authentication middleware, would be cool to not be pseudo eventually
    req.context = {
        models,
        me: await models.User.findOne({ where: {username: username} }),
    };
    next();
});

app.get('/', (req, res) => {
    return res.send('Hello world!');
});

app.use('/session', routes.session);
app.use('/user', routes.user);
app.use('/category', routes.category);
sequelize.sync({ force: eraseDatabaseOnSync }).then(() => {
    if (eraseDatabaseOnSync) {
        seedDb();
    }
    app.listen(process.env.PORT, () => {
        console.log(`Listening on port ${process.env.PORT}!`);
    });
});

const seedDb = async () => {
    await models.User.create(
        {
            username: 'admin',
            categories: [
                {
                    name: 'utilities',
                    scope: 2,
                    direction: 1,
                    type: 1,
                },
                {
                    name: 'company vehicles',
                    scope: 1,
                    direction: 2,
                    type: 0,
                },
                {
                    name: 'transportation and distribution',
                    scope: 3,
                    direction: 3,
                    type: 1,
                }
            ]
        },
        {
            include: [models.Category]
        }
    );

    await models.Contributor.create(
        {
            name: 'electricity',
            carbonProduction: 100,
            categoryId: 1,
            userId: 1,
        }
    );

    await models.Contributor.create(
        {
            name: 'water',
            carbonProduction: 150,
            categoryId: 1,
            userId: 1,
        }
    );

    await models.Contributor.create(
        {
            name: 'truck 1',
            carbonProduction: 120,
            categoryId: 2,
            userId: 1,
        }
    );

    await models.User.create(
        {
            username: 'hidden',
            categories: [
                {
                    name: 'hiddencategory',
                    scope: 1,
                    direction: 1,
                    type: 1,
                }
            ]
        },
        {
            include: [models.Category]
        }
    );

    await models.Contributor.create(
        {
            name: 'hiddencontributor',
            carbonProduction: 90,
            categoryId: 4,
            userId: 2,
        }
    );
}