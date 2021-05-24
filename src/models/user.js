import mongoose, { Schema } from "mongoose";
import uniqueValidator from "mongoose-unique-validator";
import Course from "./course";
//import slugify from 'slugify';

class User {

    initSchema() {
        const schema = new Schema({
            username: {
                type: String,
                required: true,
                unique: true
            },
            password: {
                type: String,
                required: true,
            },
            runnings: {
                type: [Course.initSchema()]
            }

        }, { timestamps: true });
        schema.plugin(uniqueValidator);
        mongoose.model("user", schema);
    }

    getInstance() {
        this.initSchema();
        return mongoose.model("user");
    }
}

export default User;
