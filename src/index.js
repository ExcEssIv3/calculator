import 'dotenv/config';
import express from 'express';
import cors from 'cors';

import models from './models/index.js';
import routes from './routes/index.js';

const app = express();

app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => { // pseudo authentication middleware, would be cool to not be pseudo eventually
    req.context = {
        models,
        me: models.users[1],
    };
    next();
});

app.get('/', (req, res) => {
    return res.send('Hello world!');
});

app.use('/session', routes.session);
app.use('/users', routes.user);
app.use('/category', routes.category);

app.listen(process.env.PORT, () => {
    console.log(`Listening on port ${process.env.PORT}!`);
});