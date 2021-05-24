import UserService from "../services/UserService.js"
import User from "../models/user";

const userService = new UserService();

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const jwtExpirySeconds = 84500;
const jwtKey = process.env.JWT_KEY || 'mySecretKey';


class UserController {

    constructor() {
        this.userService = userService;

        this.createAccount = this.createAccount.bind(this);
        this.login = this.login.bind(this);

    }

    /*
     Creation de compte et login user
     */
    async login(req, res) {
        let response = await this.userService.login(req.body);
        if (response.error) return res.status(response.statusCode).send(response);
        return res.status(201).send(response);
    }

    async createAccount(req, res) {
        let response = await this.userService.createAccount(req.body);
        if (response.error) return res.status(response.statusCode).send(response);
        return res.status(201).send(response);
    }

    async isAuthenticate(token) {

        if (token.startsWith('Bearer ')) {
            // Remove Bearer from string
            token = token.slice(7, token.length);
        }

        //get token in header
        var user = '';
        // Vériftoken Token
        if (token == null) {
            return user = null;
        }

        // verify token
        try {
            let decoded = jwt.verify(token, jwtKey);
            return user = decoded.username;
        } catch (err) {
            return user = null;
        }
    }
}

export default new UserController();