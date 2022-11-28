import 'dotenv/config';
import express from 'express';
import cors from 'cors';

import models, { sequelize } from './models/index.js';
import routes from './routes/index.js';

const app = express();
const eraseDatabaseOnSync = false;

app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(async (req, res, next) => { // pseudo authentication middleware, would be cool to not be pseudo eventually
    req.context = {
        models,
        me: await models.User.findOne({ where: {username: 'admin'} }),
    };
    next();
});

app.get('/', (req, res) => {
    return res.send('Hello world!');
});

app.use('/session', routes.session);
app.use('/users', routes.user);
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
            username: 'adminUser',
            categories: [
                {
                    name: 'utilities',
                    scope: 2,
                    direction: 1,
                    type: 1
                },
                {
                    name: 'company vehicles',
                    scope: 1,
                    direction: 2,
                    type: 0
                },
                {
                    name: 'transportation and distribution',
                    scope: 3,
                    direction: 3,
                    type: 1
                }
            ]
        },
        {
            include: [models.Category]
        }
    )
}