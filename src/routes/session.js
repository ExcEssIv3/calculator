import { Router } from 'express';

const router = Router();

router.get('/', async (req, res) => {
    console.log(req.session);
    if (req.session.loggedin) {
        return res.send('Session validated');
    } else {
        res.status(401);
        return res.send('User logged out');
    }
});

export default router;