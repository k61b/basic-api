import * as bcrypt from 'bcrypt'
import * as express from 'express'
import * as jwt from 'jsonwebtoken'
import User from 'users/user.interface'
import WrongCredentialsException from '../exceptions/WrongCredentialsException'
import Controller from '../interfaces/controller.interface'
import DataStoredInToken from '../interfaces/dataStoredInToken.interface'
import TokenData from '../interfaces/tokenData.interface'
import validationMiddleware from '../middleware/validation.middleware'
import CreateUserDto from '../users/user.dto'
import userModel from './../users/user.model'
import LogInDto from './logIn.dto'
import AuthenticationService from './authentication.service'

class AuthenticationController implements Controller {
    public path = '/auth'
    public router = express.Router()
    public authenticationService = new AuthenticationService()
    private user = userModel

    constructor() {
        this.initializeRoutes()
    }

    private initializeRoutes() {
        this.router.post(`${this.path}/register`, validationMiddleware(CreateUserDto), this.registration)
        this.router.post(`${this.path}/login`, validationMiddleware(LogInDto), this.loggingIn)
        this.router.post(`${this.path}/logout`, this.loggingOut)
    }

    private registration = async (request: express.Request, response: express.Response, next: express.NextFunction) => {
        const userData: CreateUserDto = request.body
        try {
            const {
                cookie,
                user
            } = await this.authenticationService.register(userData)
            response.setHeader('Set-Cookie', [cookie])
            response.send(user)
        } catch (error) {
            next(error)
        }
    }

    private loggingIn = async (request: express.Request, response: express.Response, next: express.NextFunction) => {
        const logInData: LogInDto = request.body
        const user = await this.user.findOne({ email: logInData.email })
        if (user) {
            const isPasswordMatching = await bcrypt.compare(logInData.password, user.get('password', null, { getters: false }))
            if (isPasswordMatching) {
                const tokenData = this.createToken(user);
                response.setHeader('Set-Cookie', [this.createCookie(tokenData)]);
                response.send(user);
            } else {
                next(new WrongCredentialsException());
            }
        } else {
            next(new WrongCredentialsException())
        }
    }

    private loggingOut = async (request: express.Request, response: express.Response, next: express.NextFunction) => {
        response.setHeader('Set-Cookie', ['Authorization=;Max-age=0']);
        response.send(200)
    }

    private createCookie(tokenData: TokenData) {
        return `Authorization=${tokenData.token}; HttpOnly; Max-Age=${tokenData.expiresIn}`
    }

    private createToken(user: User): TokenData {
        const expiresIn = 60 * 60
        const secret = process.env.JWT_SECRET
        const dataStoredInToken: DataStoredInToken = {
            _id: user._id,
        }
        return {
            expiresIn,
            token: jwt.sign(dataStoredInToken, secret, { expiresIn }),
        }
    }
}

export default AuthenticationController