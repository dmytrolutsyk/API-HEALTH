/*
 * This class will the the one managing the database, 
 * it's a singleton so it's only instanciate once 
 * but since it's using a global promise its instance can be called in multiple location in the code
*/

import mongoose from 'mongoose';



class Connection {
  constructor() {
    try {
      const url = "mongodb+srv://admin:admin1234@cluster0.v8snp6n.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
      console.log('Establish new connection with database');
      console.log("using environment var : ", url);

      mongoose.Promise = global.Promise;
      mongoose.connect(url)
      .then(() => console.log("Connected to MongoDB!"))
      .catch(err => console.error("Could not connect to MongoDB", err));

    } catch (error) {
        console.log(error);
    }
    
  }
}

export default new Connection();

