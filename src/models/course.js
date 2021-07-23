import mongoose, { Schema } from "mongoose";
import uniqueValidator from "mongoose-unique-validator";
//import slugify from 'slugify';

class Course {



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

        const courseSchema = new Schema({
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
            }

        }, { timestamps: true});
        // courseSchema.plugin(uniqueValidator);
        mongoose.model("course", courseSchema);

        return courseSchema;
    }

    getInstance() {
        this.initSchema();
        return mongoose.model("course");
    }
}

export default Course;
