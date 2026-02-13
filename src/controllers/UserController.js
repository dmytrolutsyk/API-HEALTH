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
        this.createRentalProperty = this.createRentalProperty.bind(this);
        this.getRentalPropertysOfUser = this.getRentalPropertysOfUser.bind(this);

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

    async createRentalProperty(req, res) {
        let username = await this.getUsernameOfToken(req, res);
        let rentalProperty = {
            GPSCoordinate: req.body.GPSCoordinate,
            runDistance: req.body.runDistance,
            runTime: req.body.runTime,
            startDate: req.body.startDate,
            endDate: req.body.endDate,
            tempList: req.body.tempList,
            humidityList: req.body.humidityList,
            pulseList: req.body.pulseList
        };
        if(username !== 1) {
           let response = await this.userService.createRentalProperty(username, rentalProperty);
           console.log("post RentalProperty controller response : ", response);
           return res.status(200).send(response);
        }
    }

    async getRentalPropertysOfUser(req, res) {
        let username = await this.getUsernameOfToken(req, res);
        if(username !== 1) {
            let response = await this.userService.getRentalPropertyOfUser(username);
            console.log("getRentalProperty controller response : ", response);
            return res.status(200).send(response);
        }
    }

    // Extract and return username of request token if no token send error
    async getUsernameOfToken(requete, response) {
        let token = requete.headers['x-access-token'] || requete.headers['authorization'];
        if (!token) response.status(401).send({error: "No Token found", statusCode: 401});
        let username = await this.isAuthenticate(token);
        // If not authenticate send error 401
        if (!username) {
            response.status(401).send({error: "Bad credentials", statusCode: 401});
            return 1;
        }
        else return username;
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
