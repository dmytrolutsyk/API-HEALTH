const express = require('express')

const MongoClient = require('mongodb').MongoClient;
const { ObjectId } = require('mongodb').ObjectId;
const assert = require('assert');
const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://root:root@cluster0-0vedk.mongodb.net/test?retryWrites=true&w=majority";
const PORT = process.env.PORT || 3000;
const client = new MongoClient( MONGODB_URI, { useNewUrlParser: true });
var db;
const app = express();
const url = process.env.MONGODB_URI || 'mongodb://localhost:' + 27017 + '/temperature';
const dbName = "temperature";

app.listen(8080, () => {
    console.log("Serveur à l'écoute")
  })

// MARK- : Put a temp to data base
app.put('/sensorsData', async function(req, res){
    try {
        const col = db.collection('temperature');
        let temperature = req.body.temperature;
        let resInsert = await col.insertOne({
            temperature
        });
        //let temp = resInsert.ops[0];
       /* res.send({
            error: null,
            temp
        });*/
    } catch (err){
        res.send({
            error: err
        });
    }
    
})


/*GET all temp*/
app.get('/sensorsData', async function(req, res) {
    try {
        const col = db.collection('temperature');
        let results = await col.find().sort({ _id: -1}).toArray();
        res.send({
            error: null,
            annonces: results
        });
        console.log("temp trouvé !!!!!")
    } catch (err) {
        console.log("pas trouvé !!!!!")
        res.send({
            error: err
        });
    }            
});

