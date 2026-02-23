import mongoose, { Schema } from "mongoose";
import uniqueValidator from "mongoose-unique-validator";
import RentalProperty from "./rentalProperty";
//import slugify from 'slugify';

class User {
    initSchema() {
        const schema = new Schema({
            // --- Identité ---
            username: {
                type: String,
                required: true,
                unique: true,
                trim: true
            },
            email: {
                type: String,
                required: true,
                unique: true,
                lowercase: true,
                match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Veuillez remplir un email valide']
            },
            password: {
                type: String,
                required: true,
                select: false // Le mot de passe ne sera pas retourné par défaut dans les requêtes
            },

            // --- Profil ---
            firstName: { type: String, required: true },
            lastName: { type: String, required: true },
            phoneNumber: { type: String },
            avatar: { type: String }, // URL de la photo de profil
            bio: { type: String, maxlength: 500 },

            // --- Rôles et Statuts ---
            role: { 
                type: String, 
                enum: ['traveler', 'host', 'admin'], 
                default: 'traveler' 
            },
            isVerified: { type: Boolean, default: false }, // Pour vérifier l'email ou l'identité

            // --- Relations ---
            // On stocke les IDs des annonces plutôt que les objets complets pour la performance
            rentalProperties: [{
                type: Schema.Types.ObjectId,
                ref: "rentalProperty"
            }]

        }, { timestamps: true });

        schema.plugin(uniqueValidator);
        
        // Evite de re-déclarer le modèle si on appelle getInstance plusieurs fois
        if (!mongoose.models.user) {
            mongoose.model("user", schema);
        }
    }

    getInstance() {
        this.initSchema();
        return mongoose.model("user");
    }
}

export default User;