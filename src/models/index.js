import 'dotenv/config';
import { Sequelize } from "sequelize";

import getUserModel from "./user.js";
import getCategoryModel from "./category.js";
import getContributorModel from './contributor.js';

const sequelize = new Sequelize({
    database: process.env.DATABASE,
    username: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    host: process.env.DATABASE_HOST,
    port: process.env.DATABASE_PORT,
    dialect: 'postgres',
    
});

const models = {
    User: getUserModel(sequelize, Sequelize),
    Category: getCategoryModel(sequelize, Sequelize),
    Contributor: getContributorModel(sequelize, Sequelize),
};

Object.keys(models).forEach((key) => {
    if ('associate' in models[key]) {
        models[key].associate(models);
    }
});

export { sequelize };

export default models;