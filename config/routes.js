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

    app.post('/user', userController.createAccount);
    app.post(`/api/user/createAccount`, userController.createAccount);

    
}