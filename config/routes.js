/** FIle Containing all of our API's Routes*/

// Import Controller
import userController from "../src/controllers/UserController"


// Utilisé dans /config/server.js
export default (app) => {

  
/**
   * Here you place your Routes
   */
    app.get('/', function(req,res) {
        res.send("Welcome to your API");
    })

    // User Part
    app.post('/user/signUp', userController.createAccount);
    app.post('/user/signIn', userController.login);
    app.put('/user', userController.updateUser);

    // RentalProperty Part
    app.get('/user/rentalPropertys', userController.getRentalPropertysOfUser);
    app.post('/user/rentalProperty', userController.createRentalProperty);


}