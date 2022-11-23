let users = {
    1: {
        id: '1',
        username: 'TestUser'
    }
};

let categories = {
    1: {
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
    2: {
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
};

export default {
    users,
    categories,
}