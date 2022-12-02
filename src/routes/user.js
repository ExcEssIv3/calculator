import { Router } from 'express';

const router = Router();

// route commented because fuckiness with unauthenticated routes and throwing errors. this is probably bad but until i need a /user route it will stay like this :/
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

    // requests user from db by findByLogin which excludes user's password hash and salt
    return res.send(await req.context.models.User.findByLogin(req.body.username));
});

export default router;