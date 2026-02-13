/*
 * This class will the the one managing the database, 
 * it's a singleton so it's only instanciate once 
 * but since it's using a global promise its instance can be called in multiple location in the code
*/

import mongoose from 'mongoose';



class Connection {
  constructor() {
    try {
        const url = process.env.MONGODB_URI || "mongodb+srv://admin:admin@cluster0.v8snp6n.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
    console.log('Establish new connection with database');
    console.log("using environment var : ", url);

    //mongoose.Promise = global.Promise; -> Global Promise
    mongoose.Promise = global.Promise;
    mongoose.connect(url);
    } catch (error) {
        console.log(error);
    }
    
  }
}

export default new Connection();

