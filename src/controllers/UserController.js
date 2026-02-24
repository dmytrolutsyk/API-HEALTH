import userService from "../services/UserService.js"; // Import de l'instance déjà créée ou du service
import UserService from "../services/UserService.js"
import jwt from 'jsonwebtoken';

const jwtKey = process.env.JWT_KEY || 'mySecretKey';

class UserController {
    constructor() {
       this.userService = new UserService();
        // On bind les méthodes pour garder le contexte du "this"
        this.createAccount = this.createAccount.bind(this);
        this.login = this.login.bind(this);
        this.createRentalProperty = this.createRentalProperty.bind(this);
        this.getRentalPropertysOfUser = this.getRentalPropertysOfUser.bind(this);
        this.getRentalProperty = this.getRentalProperty.bind(this);
        this.updateUser = this.updateUser.bind(this);
        this.deleteUser = this.deleteUser.bind(this);
        this.updateRentalProperty = this.updateRentalProperty.bind(this);
        this.deleteRentalProperty = this.deleteRentalProperty.bind(this);
    }

    async login(req, res) {
        try {
            let response = await this.userService.login(req.body);
            if (response.error) return res.status(response.statusCode).json(response);
            return res.status(200).json(response); // 200 pour login
        } catch (e) {
            return res.status(500).json({ error: "Internal Server Error" });
        }
    }

    async createAccount(req, res) {
        try {
            let response = await this.userService.createAccount(req.body);
            if (response.error) return res.status(response.statusCode).json(response);
            return res.status(201).json(response);
        } catch (e) {
    console.log(e); // Pour voir l'erreur dans ton terminal
    return res.status(500).json({ error: e.message }); // Pour voir l'erreur dans Postman
}
    }

    async createRentalProperty(req, res) {
        // On récupère le username. Si c'est null, le helper a déjà répondu 401.
        let username = await this.getUsernameOfToken(req, res);
        if (!username) return; 

        const rentalProperty = {
            title: req.body.title,
            description: req.body.description,
            pricePerNight: req.body.pricePerNight,
            propertyType: req.body.propertyType,
            location: {
                address: req.body.address,
                city: req.body.city,
                zipCode: req.body.zipCode,
                coordinates: req.body.coordinates 
            },
            details: {
                maxGuests: req.body.maxGuests,
                bedroomCount: req.body.bedroomCount,
                bathroomCount: req.body.bathroomCount,
                surfaceArea: req.body.surfaceArea
            },
            amenities: req.body.amenities || [],
            images: req.body.images || [],
            status: 'published'
        };

        try {
            let response = await this.userService.createRentalProperty(username, rentalProperty);
            return res.status(201).json(response);
        } catch (error) {
            return res.status(500).json({ message: "Erreur lors de la sauvegarde." });
        }
    }

    async getRentalPropertysOfUser(req, res) {
        let username = await this.getUsernameOfToken(req, res);
        if (!username) return;

        try {
            let response = await this.userService.getRentalPropertyOfUser(username);
            return res.status(200).json(response);
        } catch (error) {
            return res.status(500).json({ message: "Erreur récupération." });
        }
    }

    async getRentalProperty(req, res) {
        const username = await this.getUsernameOfToken(req, res);
        if (!username) return;

        const { id } = req.params;

        try {
            const response = await this.userService.getRentalProperty(username, id);

            if (response.error) {
                return res.status(response.statusCode || 400).json(response);
            }

            return res.status(200).json(response.property);
        } catch (error) {
            return res.status(500).json({ message: "Erreur lors de la récupération de l'annonce." });
        }
    }

    async updateRentalProperty(req, res) {
        const username = await this.getUsernameOfToken(req, res);
        if (!username) return;

        const { id } = req.params;

        try {
            const response = await this.userService.updateRentalProperty(username, id, req.body);

            if (response.error) {
                return res.status(response.statusCode || 400).json(response);
            }

            return res.status(200).json(response.property);
        } catch (error) {
            return res.status(500).json({ message: "Erreur lors de la mise à jour de l'annonce." });
        }
    }

    async updateUser(req, res) {
        const username = await this.getUsernameOfToken(req, res);
        if (!username) return;

        try {
            const response = await this.userService.updateUser(username, req.body);

            if (response.error) {
                return res.status(response.statusCode || 400).json(response);
            }

            return res.status(200).json(response.user);
        } catch (error) {
            return res.status(500).json({ message: "Erreur lors de la mise à jour du profil." });
        }
    }

    async deleteUser(req, res) {
        const username = await this.getUsernameOfToken(req, res);
        if (!username) return;

        try {
            const response = await this.userService.deleteUser(username);

            if (response.error) {
                return res.status(response.statusCode || 400).json(response);
            }

            return res.status(200).json({ message: "Utilisateur supprimé avec succès" });
        } catch (error) {
            return res.status(500).json({ message: "Erreur lors de la suppression de l'utilisateur." });
        }
    }

    async deleteRentalProperty(req, res) {
        const username = await this.getUsernameOfToken(req, res);
        if (!username) return;

        const { id } = req.params;

        try {
            const response = await this.userService.deleteRentalProperty(username, id);

            if (response.error) {
                return res.status(response.statusCode || 400).json(response);
            }

            return res.status(200).json({ message: "Annonce supprimée avec succès" });
        } catch (error) {
            return res.status(500).json({ message: "Erreur lors de la suppression de l'annonce." });
        }
    }

    // --- HELPERS ---

    async getUsernameOfToken(req, res) {
        let token = req.headers['x-access-token'] || req.headers['authorization'];
        
        if (!token) {
            res.status(401).json({ error: "No Token found" });
            return null;
        }

        let username = await this.isAuthenticate(token);
        
        if (!username) {
            res.status(401).json({ error: "Invalid or expired token" });
            return null;
        }
        
        return username;
    }

    async isAuthenticate(token) {
        if (token.startsWith('Bearer ')) {
            token = token.slice(7, token.length);
        }

        try {
            let decoded = jwt.verify(token, jwtKey);
            return decoded.username;
        } catch (err) {
            return null;
        }
    }
}

export default new UserController();