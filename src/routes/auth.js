import { Router } from 'express';

const router = Router();

router.post('/login', async (req, res) => {
    let username = req.body.username;
    let password = req.body.password;

    if (username && password) {
        const user = await req.context.models.User.findByLogin(username);

        if (!user) {
            res.status(400);
            return res.send('User does not exist');
        }
        if (await req.context.models.User.validatePassword(user.dataValues.id, password)) {
            req.session.loggedin = true;
            req.session.username = username;

            // res.redirect('/home'); // not sure if this will work with a real website
            return res.send('Authenticated');
        } else {
            res.status(401);
            return res.send('Incorrect username or password');
        }
    }

    res.status(400)
    return res.send('Username or password field is empty');
});

router.get('/logout', (req, res) => {
    req.session.destroy();
    res.send('Logged out');
})

export default router;