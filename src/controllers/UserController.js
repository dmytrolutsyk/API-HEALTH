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
    // 1. Récupération de l'utilisateur via le token
    let username = await this.getUsernameOfToken(req, res);

    // Vérification de l'authentification (si username est valide)
    if (username && username !== 1) {
        
        // 2. Construction de l'objet RentalProperty avec les bonnes données
        const rentalProperty = {
            title: req.body.title,
            description: req.body.description,
            pricePerNight: req.body.pricePerNight,
            propertyType: req.body.propertyType,
            location: {
                address: req.body.address,
                city: req.body.city,
                zipCode: req.body.zipCode,
                coordinates: req.body.coordinates // Attendu: [longitude, latitude]
            },
            details: {
                maxGuests: req.body.maxGuests,
                bedroomCount: req.body.bedroomCount,
                bathroomCount: req.body.bathroomCount,
                surfaceArea: req.body.surfaceArea
            },
            amenities: req.body.amenities || [], // Array de chaînes de caractères
            images: req.body.images || [],       // Array d'URLs
            status: 'published'                  // Statut par défaut
        };

        try {
            // 3. Appel au service pour la création en base de données
            let response = await this.userService.createRentalProperty(username, rentalProperty);
            
            console.log("Post RentalProperty controller response : ", response);
            return res.status(201).send(response); // 201 est le code HTTP pour "Created"
        } catch (error) {
            console.error("Erreur lors de la création :", error);
            return res.status(500).send({ message: "Erreur lors de la sauvegarde de l'annonce." });
        }
   } else {
        return res.status(401).send({ message: "Utilisateur non autorisé." });
    }
}

    /*async getRentalPropertysOfUser(req, res) {
        let username = await this.getUsernameOfToken(req, res);
        if(username !== 1) {
            let response = await this.userService.getRentalPropertyOfUser(username);
            console.log(`Récupération de ${response?.length || 0} annonces pour : ${username}`);
            return res.status(200).send(response);
        }
    }*/

    async getRentalPropertysOfUser(req, res) {
    try {
        // 1. Récupération de l'identité de l'utilisateur
        let username = await this.getUsernameOfToken(req, res);

        // 2. Vérification de l'authentification
        // (On suppose que 1 est ton code d'erreur pour "Non autorisé")
        if (!username || username === 1) {
            return res.status(401).json({ message: "Utilisateur non authentifié." });
        }

        // 3. Appel au service pour récupérer la LISTE des annonces
        let response = await this.userService.getRentalPropertyOfUser(username);

        // 4. Log pour le debug (optionnel en prod)
        console.log(`Récupération de ${response?.length || 0} annonces pour : ${username}`);

        // 5. Retourner les données (même si le tableau est vide [])
        return res.status(200).json(response);

    } catch (error) {
        // 6. Gestion des erreurs critiques (BDD, Service planté, etc.)
        console.error("Erreur getRentalPropertiesOfUser :", error);
        return res.status(500).json({ message: "Erreur lors de la récupération de vos annonces." });
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
