import mongoose, { Schema } from "mongoose";
import uniqueValidator from "mongoose-unique-validator";
//import slugify from 'slugify';

class RentalProperty {

    static initSchema() {
        const GPSCoordinateSchema = new Schema({
            longitude: {
                type: Number,
                required: true,
            },
            latitude: {
                type: Number,
                required: true,
            }
        }, {timestamps: true});

        const rentalPropertySchema = new Schema({
            GPSCoordinate: {
                type: [GPSCoordinateSchema],
                required: true,
            },
            runDistance: {
                // en nombre de metre
                type: Number,
            },
            runTime: {
                // en nombre de seconde
                type: Number
            },
            startDate: {
                // en nombre de seconde
                type: Date
            },
            endDate: {
                // en nombre de seconde
                type: Date
            },
            tempList: {
                // Liste de tempétatures enrégistrés
                type: [Number],
                required: true
            },
            humidityList: {
                // Liste de taux d'humidités enrégistrés
                type: [Number],
                required: true
            },
            pulseList: {
                // Liste de BPM enrégistrés
                type: [Number],
                required: true
            }

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
