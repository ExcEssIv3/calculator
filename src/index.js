import 'dotenv/config';
import express from 'express';
import cors from 'cors';

import models, { sequelize } from './models/index.js';
import routes from './routes/index.js';

// const path = require('path');
// const session = require('express-session');
import path from 'path';
import session from 'express-session';

const app = express();
const eraseDatabaseOnSync = true;

const login = 'admin';

app.use(cors());

app.use(session({
    secret: process.env.SESSION,
    resave: true,
    saveUninitialized: true
}))

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// app.use(express.static(path.join(__dirname, 'static')));

app.use(async (req, res, next) => { // pseudo authentication middleware, would be cool to not be pseudo eventually
    req.context = {
        models,
        me: await models.User.findByLogin(login),
    };
    next();
});


app.get('/', (req, res) => {
    return res.send('Hello world!');
});

// app.use('/session', routes.session);
app.use('/user', routes.user);
app.use('/category', routes.category);
app.use('/auth', routes.auth);

app.use((error, req, res, next) => {
    return res.status(500).json({ error: error.toString() });
});

app.get('/totalOutput', async (req, res, next) => {
    const sum = await models.Contributor.sum('carbonProduction', {
        where: { userId: req.context.me.id }
    }).catch(next);

    return res.send({ total: (sum === null) ? 0 : sum });
});

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
            email: 'admin@url.com',
            hash: 'password',
            categories: [
                {
                    name: 'utilities',
                    scope: 2,
                    direction: 'Upstream',
                    type: 'Indirect',
                },
                {
                    name: 'company vehicles',
                    scope: 1,
                    direction: 'Reporting',
                    type: 'Direct',
                },
                {
                    name: 'company facilities',
                    scope: 1,
                    direction: 'Reporting',
                    type: 'Direct',
                },
                {
                    name: 'transportation and distribution',
                    scope: 3,
                    direction: 'Downstream',
                    type: 'Indirect',
                },
                {
                    name: 'employee commute',
                    scope: 3,
                    direction: 'Downstream',
                    type: 'Indirect',
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
            email: 'hidden@url.com',
            hash: 'password',
            categories: [
                {
                    name: 'hiddencategory',
                    scope: 1,
                    direction: 'Upstream',
                    type: 'Indirect',
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