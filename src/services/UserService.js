import User from "../models/user";
import RentalPropertyModel from "../models/rentalProperty"; // Assure-toi d'importer le modèle de l'annonce

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const jwtExpirySeconds = 84500;
const jwtKey = process.env.JWT_KEY || 'mySecretKey';

class UserService {
    constructor() {
        this.userModel = new User().getInstance();
        // Initialiser le modèle RentalProperty pour pouvoir créer des documents
        this.rentalModel = new RentalPropertyModel().getInstance(); 
        
        this.createAccount = this.createAccount.bind(this);
        this.login = this.login.bind(this);
    }

    async login(credentials) {
        try {
            // Important: .select('+password') car on l'a caché dans le schéma
            const user = await this.userModel.findOne({ username: credentials.username }).select('+password');

            if (user) {
                // Comparaison directe du password clair avec le password hashé en BDD
                const isMatch = await bcrypt.compare(credentials.password, user.password);

                if (isMatch) {
                    const username = user.username;
                    const token = jwt.sign({ username }, jwtKey, {
                        algorithm: 'HS256',
                        expiresIn: jwtExpirySeconds
                    });

                    return { error: null, token: token };
                }
                return { error: 'Mot de passe incorrect', statusCode: 403 };
            }
            return { error: 'Cet identifiant est inconnu', statusCode: 404 };
        } catch (error) {
            return { error: 'Erreur serveur', statusCode: 500 };
        }
    }

    async createAccount(credentials) {
        // Ajoute les champs firstName/lastName requis par ton nouveau schéma
        const userData = {
            username: credentials.username,
            password: credentials.password,
            email: credentials.email, // Ajouté
            firstName: credentials.firstName || "Prénom", // Ajouté
            lastName: credentials.lastName || "Nom"      // Ajouté
        };

        if (userData.password.length < 4) {
            return { error: 'Mot de passe trop court', statusCode: 400 };
        }

        // Hachage du mot de passe
        userData.password = bcrypt.hashSync(userData.password, 8);

        try {
            await this.userModel.create(userData);
            const token = jwt.sign({ username: userData.username }, jwtKey, {
                algorithm: 'HS256',
                expiresIn: jwtExpirySeconds
            });

            return { error: null, token };
        } catch (error) {
            return { error: 'Username ou Email déjà utilisé', statusCode: 402 };
        }
    }

    async createRentalProperty(username, rentalData) {
        try {
            const user = await this.userModel.findOne({ username });
            if (!user) return { error: "User non trouvé", statusCode: 404 };

            // 1. On crée l'annonce dans sa propre collection
            // On ajoute l'ID du propriétaire à l'annonce
            rentalData.owner = user._id; 
            const newProperty = await this.rentalModel.create(rentalData);

            // 2. On ajoute la référence (ID) dans le tableau du User
            user.rentalProperties.push(newProperty._id);
            await user.save();

            return { property: newProperty, statusCode: 201 };
        } catch (error) {
            console.error(error);
            return { error: "Erreur lors de la création de l'annonce", statusCode: 400 };
        }
    }

    async getRentalPropertyOfUser(username) {
        try {
            // .populate transforme les IDs du tableau en vrais objets RentalProperty
            const user = await this.userModel.findOne({ username }).populate('rentalProperties');
            
            if (!user) return { error: "User introuvable", statusCode: 404 };
            
            return user.rentalProperties; 
        } catch (error) {
            return { error: "Erreur lors de la récupération", statusCode: 500 };
        }
    }

    async updateUser(username, updates) {
        try {
            const allowedFields = [
                'email',
                'firstName',
                'lastName',
                'phoneNumber',
                'avatar',
                'bio'
            ];

            const updateData = {};
            allowedFields.forEach((field) => {
                if (Object.prototype.hasOwnProperty.call(updates, field)) {
                    updateData[field] = updates[field];
                }
            });

            if (updates.password) {
                if (updates.password.length < 4) {
                    return { error: 'Mot de passe trop court', statusCode: 400 };
                }
                updateData.password = bcrypt.hashSync(updates.password, 8);
            }

            const user = await this.userModel.findOneAndUpdate(
                { username },
                { $set: updateData },
                { new: true, runValidators: true }
            );

            if (!user) {
                return { error: "User introuvable", statusCode: 404 };
            }

            return { error: null, user, statusCode: 200 };
        } catch (error) {
            console.error('Update user error:', error);

            // Gestion plus précise des erreurs Mongo/Mongoose
            if (error.code === 11000) {
                // Doublon sur un champ unique (email, username, ...)
                const field = Object.keys(error.keyValue || {})[0] || 'champ';
                return { error: `${field} déjà utilisé`, statusCode: 402 };
            }

            if (error.name === 'ValidationError') {
                const messages = Object.values(error.errors).map(e => e.message);
                return { error: messages.join(', '), statusCode: 400 };
            }

            return { error: "Erreur lors de la mise à jour", statusCode: 500 };
        }
    }
}

export default UserService;