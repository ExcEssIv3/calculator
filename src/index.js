require('dotenv/config');
const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

let users = [
    {
        id: '1',
        username: 'TestUser'
    }
]
let categories = [
    {
        id: '1',
        name: 'transportation',
        contributors: [
            {
                id: '1',
                name: 'truck',
                carbonOutput: 8
            }
        ]
    },
    {
        id: '2',
        name: 'utilities',
        contributors: [
            {
                id: '1',
                name: 'electricity',
                carbonOutput: 50
            },
            {
                id: '2',
                name: 'water',
                carbonOutput: 20
            }
        ]
    }
];


const app = express();

app.use(cors());

app.use(express.json());

app.get('/', (req, res) => {
    return res.send('Hello world!');
});



app.get('/category', (req, res) => {
    return res.send(JSON.stringify(categories));
});

app.get('/category/:categoryId', (req, res) => {
    return res.send(JSON.stringify(categories.find(category => category.id === req.params.categoryId)));
});

app.get('/category/:categoryId/contributor/:contributorId', (req, res) => {
    return res.send(JSON.stringify(categories.find(category => category.id === req.params.categoryId).contributors.find(contributor => contributor.id === req.params.contributorId)));
});

app.post('/category', (req, res) => {
    categories.push(req.body.category);

    return res.send(category);
})

app.listen(process.env.PORT, () => {
    console.log(`Listening on port ${process.env.PORT}!`);
});