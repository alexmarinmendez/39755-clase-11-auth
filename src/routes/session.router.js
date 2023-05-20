import { Router } from "express";
import UserModel from "../dao/models/user.model.js";
import { createHash, isValidPassword } from "../utils.js";
import passport from "passport"

const router = Router()

//Vista para registrar usuarios
router.get('/register', (req, res) => {
    res.render('sessions/register')
})

// API para crear usuarios en la DB
router.post('/register', passport.authenticate('register', {
    failureRedirect: '/session/failRegister'
}), async(req, res) => {
    res.redirect('/session/login')
})

router.get('/session/failRegister', (req, res) => {
    res.send({ error: 'Failed!'})
})

// Vista de Login
router.get('/login', (req, res) => {
    res.render('sessions/login')
})

// API para login
router.post('/login', async (req, res) => {
    const { email, password } = req.body

    const user = await UserModel.findOne({email}).lean().exec()
    if(!user) {
        return res.status(401).render('errors/base', {
            error: 'User doesnot exists'
        })
    }

    if (!isValidPassword(user, password)) {
        return res.status(403).send({ status: 'error', error: 'Incorrect pass'})
    }

    delete user.password
    req.session.user = user
    res.redirect('/products')
})

// Cerrar Session
router.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if(err) {
            console.log(err);
            res.status(500).render('errors/base', {error: err})
        } else res.redirect('/session/login')
    })
})



export default router