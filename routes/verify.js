const config = require('../utils/config')
const nodemailer = require('nodemailer')
const passport = require('passport')
const User = require('../models/users.js')
const xoauth2 = require('xoauth2')

const express = require('express')
const router = express.Router()

const { BadRequestError, ForbiddenError, InternalServerError } = require('../utils/errors')

// Verify the email address with the given verification code
router.post('/', async (req, res, next) => {
    // Parameters are missing
    if (!req.query.email || !req.query.code) {
        throw new BadRequestError('Missing required parameters: email or code')
    }

    const user = await User.findUserByEmail(req.query.email)
    // Email is not associated with an existing user
    if (!user) {
        throw new BadRequestError('Specified email is unused or invalid')
    }

    if (await User.verifyEmail(user._id, req.query.code)){
        return res.status(200).json({
            msg:"Success"
        })
    }
    else {
        throw new ForbiddenError('Verification code is incorrect or expired')
    }
})

// Generate a new email verification code and send an email to the user containing the new code
router.post('/newcode',passport.authenticate('jwt',{session:false}), async (req, res, next) => {
    const code = await User.createVerification(req.user._id)
    // Code generation failed
    if (!code) {
        throw new InternalServerError('The server encountered a problem')
    }
    
    // Don't send emails when the test suites are running
    if (process.env.NODE_ENV === 'test') {
        return res.status(200).json({
            success: true,
            message: 'Verification code reset; sending emails is disabled in testing mode'
        })
    }
    
    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        auth: {
            type: 'OAuth2',
            user: config.PROJECT_EMAIL,
            clientId: config.CLIENT_ID,
            clientSecret: config.CLIENT_SECRET,
            refreshToken: config.REFRESH_TOKEN, 
            accessToken: config.ACCESS_TOKEN
        },
        tls: {
            // Don't require cert if being run from localhost
            rejectUnauthorized: (process.env.NODE_ENV === 'dev') ? false : true
        }
    })

    const emailHTML = `
        <h3>Hello from 2+ Community!</h3>
        <p>Thank you for creating a Measuring Place account. Please enter the code below in the app to verify your email address.</p>

        <p><b>Your code is:</b> ${code}</p>
    `
    
    const mailOptions = {
        from: `"2+ Community" <${config.PROJECT_EMAIL}>`,
        to: req.user.email,
        subject: 'Email Verification',
        text: `Thank you for creating a Measuring Place account. 
            Please enter the following code in the app to verify your email address: ${code}`,
        html: emailHTML
    }

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log(error)
            throw new InternalServerError('The server encountered a problem')
        }
        console.log(`Sent email to ${req.user.email}`)
        res.status(200).json({
            success: true,
            message: 'Verification code reset; please check your email'
        })
    })
})

module.exports = router