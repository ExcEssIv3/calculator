import 'dotenv/config';
import express from 'express';
import cors from 'cors';

import models, { sequelize } from './models/index.js';
import routes from './routes/index.js';

import session from 'express-session';

const app = express();
const eraseDatabaseOnSync = true;

const production = true; // turn to true to require login cookie


app.use(cors());

app.use(session({
    secret: process.env.SESSION,
    resave: false,
    saveUninitialized: true,
    cookie: {
        maxAge: 86400000, // one day in milliseconds
        // secure: true,

    },

}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(async (req, res, next) => { // authentication middleware
    const unauthenticatedRoutes = [ // routes that don't require authentication
        '/auth/login/',
        '/session/',
        '/user/'
    ];

    req.context = { // baseline context object, pretty much everything needs the models
        models
    };

    
    if (unauthenticatedRoutes.find((route) => { // allow unauthenticated paths
        if (req.path.endsWith('/')) return route === req.path; // function allows inclusion or not inclusion of '/' at end of a route
        return route === req.path + '/';
    })) {
        next();
    } else if (req.session.username) { // check if username tag exists in session
        const user = await models.User.findByLogin(req.session.username);
        if (user) { // check if user is in db
            req.context.me = user;
            next();
        } else { // user not found in db
            res.status(401);
            res.send('Authentication failed, user does not exist');
        }
    } else if (!production) { // if not in production, and user isn't defined, mock user as admin
        req.context.me = await models.User.findByLogin('admin');
        next();
    } else { // no session token or username not in session token
        res.status(401);
        res.send('Access denied: not authenticated')        
    }
});


app.get('/', (req, res) => {
    return res.send('Hello world!');
});

app.use('/user', routes.user);
app.use('/category', routes.category);
app.use('/auth', routes.auth);
app.use('/session', routes.session);

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