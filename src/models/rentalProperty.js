import mongoose, { Schema } from "mongoose";
import uniqueValidator from "mongoose-unique-validator";
//import slugify from 'slugify';

class RentalProperty {

    static initSchema() {
        const rentalPropertySchema = new Schema({
            title: { type: String, required: true, trim: true },
            description: { type: String, required: true },
            pricePerNight: { type: Number, required: true },
            location: {
                city: String,
                address: String,
                coordinates: {
                type: [Number], // [longitude, latitude]
                index: '2dsphere' 
                }
            },
            details: {
                guests: Number,
                bedrooms: Number,
                bathrooms: Number
            },
            amenities: [String],
            images: [String],
            owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
            
        }, { timestamps: true});
        // rentalPropertySchema.plugin(uniqueValidator);
        mongoose.model("rentalProperty", rentalPropertySchema);

        return rentalPropertySchema;
    }

    getInstance() {
        this.initSchema();
        return mongoose.model("rentalProperty");
    }
}

export default RentalProperty;
