import { Router } from 'express';

const router = Router();

// route commented because fuckyness with unauthenticated routes and throwing errors. this is probably bad but until i need a /user route it will stay like this :/
// router.get('/', (req, res) => {
//     return res.send(req.context.me);
// });

router.post('/', async (req, res, next) => {
    const user = await req.context.models.User.create({
        username: req.body.username,
        email: req.body.email,
        hash: req.body.password,     
    }).catch(next);

    req.session.loggedin = true;
    req.session.username = req.body.username;
    // user return commented out because returns hash and salt tokens. this is almost certainly bad. needs fixing
    // return res.send(user);
    return res.send('User created, authenticated');
});

export default router;