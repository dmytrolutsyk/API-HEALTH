import User from "../models/user";
import RentalProperty from "../models/rentalProperty";

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const jwtExpirySeconds = 84500;
const jwtKey = process.env.JWT_KEY || 'mySecretKey';

class UserService {

    constructor() {
        this.userModel = new User().getInstance();
        this.createAccount = this.createAccount.bind(this);
        this.login = this.login.bind(this);

    }

    async login(credentials) {

        let user = await this.userModel.findOne({username: credentials.username});

        try {

            if (user) {

                // Hash password given by the user
                const hashedPassword = bcrypt.hashSync(credentials.password, 8);

                //Compare two hash
                const authenticate = bcrypt.compareSync(credentials.password, user.password);

                if (authenticate) {

                    let username = credentials.username;
                    // Générate token for the user
                    const token = jwt.sign({username}, jwtKey, {
                        algorithm: 'HS256',
                        expiresIn: jwtExpirySeconds
                    });

                    return {
                        error: null,
                        token: token,
                    };

                } else {
                    return {
                        error: 'Mot de passe incorrect',
                        statusCode: 403
                    };
                }

            } else {
                return {
                    error: 'Cet identifiant est inconnu',
                    statusCode: 402
                };
            }
        }

            // Internal error
        catch (error) {
            return {
                error: true,
                statusCode: 500,
                message: error.errmsg || 'Impossible de créer l\'objet',
                errors: error.errors
            };
        }
    }

    async createAccount(credentials) {

        let user = {
            username: credentials.username,
            password: credentials.password
        }

        // Vérif username and password
        if (user.password.length < 4) {
            return {
                error: 'Le mot de passe doit contenir au moins 4 caractères',
                statusCode: 402
            };
        }
        if (!/^[a-z + A-Z]+$/.test(user.username)) {
            return {
                error: 'Votre identifiant ne doit contenir que des lettres minuscules non accentuées',
                statusCode: 400
            };
        }
        if (user.username.length < 2 || user.username.length > 20) {
            return {
                error: 'Votre identifiant doit contenir entre 2 et 20 caractères',
                statusCode: 400
            };
        }

        // Hash password
        user.password = bcrypt.hashSync(user.password, 8);

        try {
            let item = await this.userModel.create(user);
            let username = user.username;

            const token = jwt.sign({username}, jwtKey, {
                algorithm: 'HS256',
                expiresIn: jwtExpirySeconds // 24 hour
            });

            return {
                error: null,
                token
            };

        } catch (error) {
            return {
                error: 'Ce username est déja utilisé',
                statusCode: 402
            };
        }
    }

    async getRentalPropertyOfUser(username) {

        try {
            // Get user with username
            let user = await this.userModel.findOne({username: username});
            console.log(user);
            if(user) {
                let rentalPropertys = user.rentalPropertys;
                console.log(rentalPropertys);
                return {
                    rentalProperty: rentalProperty,
                    statusCode: 200
                };
            }else {
                return {
                    error: "User introuvable",
                    statusCode: 404
                };
            }
        } catch (error) {
            console.log(error);
            return {
                error: error,
                statusCode: 402
            };
        }
    }

    async createRentalProperty(username, rentalProperty){
        try {
            console.log("create rentalProperty service rentalProperty param :", rentalProperty);
            let userUpdated = await this.userModel.findOneAndUpdate({username: username}, {$push: {rentalPropertys: rentalProperty} });
            console.log("create rentalProperty service updated user: ", userUpdated);
            return {
                user: userUpdated,
                statusCode: 200
            }
        } catch (error) {
            console.log(error);
            return {
                error: error,
                statusCode: 402
            };
        }
    }

}

export default UserService;