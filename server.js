const express = require("express");
const app = express();
const { MongoClient } = require('mongodb');
const PORT = 8080;
const url = "mongodb://localhost:27017";
const dbName = "Project";
const collectionName = "inventory";



app.use(express.json())


function connectToDatabase() {
  try {
    const client = new MongoClient(url);
    client.connect();
    const db = client.db(dbName);
    console.log('Connected to MongoDB');
    return db;
  } catch (error) {
    console.error('Failed to connect to MongoDB', error);
    throw error;
  }
}


const db = connectToDatabase();
const inventory = db.collection('inventory');
// const cursor = inventory.find()
// const documents = cursor.toArray((err,docs) => {
//             if(err){
//                 console.log(err)
//             }
//              docs;
//         }).then((value) => console.log(value));

// console.log(documents);
       

app.get('/items', async (req,res) => {
    try{
        const cursor = inventory.find();
        const docs = await cursor.toArray();
        res.status(200).json(docs);
    }catch(error){
        res.status(500).send({error_message:`An error was raised while executing ${error}`});
    }
});


 
app.get('/items/:id', async (req,res) => {
    try{
        const { id } = req.params;
        const query = {id:id};
        const cursor = inventory.find(query);
        const docs = await cursor.toArray();
        res.status(200).json(docs);
        }catch(error){
        res.status(500).send({error_message:`An error was raised while executing ${error}`});
    }
});

app.post('/items', async (req,res) => {
    try{
        const id = Date.now().toString(36) + Math.random().toString(36);
        const {name, amount} = req.body;
        const document = {'id':id,'name':name,'amount':amount};
        await inventory.insertOne(document);
        const string = `{"id":"${id}", "name":"${name}", "amount":${amount}}`.replace(/[\\"]/g, '');
        res.status(200).send({message:`Document id ${id} was added Succesfully. The document added: ${string}. `});
    }catch(error){
        res.status(500).send({error_message:`There was an error adding the item you sent ${error}` });
    }
})
app.patch('/items/:id', async (req, res) => {
    try{
        const {id} = req.params;
        const filter = {id:id};
        const update = {$set:{}};
        if(req.body.name) update.$set.name = req.body.name;
        if(req.body.amount) update.$set.amount = req.body.amount;
        await inventory.updateOne(filter, update);
        const query = {id:id};
        const cursor = inventory.find(query);
        const docs = await cursor.toArray();
        res.status(200).json({message:`the item with id: ${id} has beed succesfully updated`, updated_doc:docs});

    }catch(error){
        res.status(500).send({error_message: `there was an error updating the document. error: ${error}`});
    }
})

app.delete('/items/:id', async (req,res) => {
    try{
        const {id} = req.params;
        const filter = {id:id};
        await inventory.deleteOne(filter);
        res.status(200).send({message:`the document with id: ${id} was succesfully deleted`});
    }catch(error){
        res.status(500).send({error_message: `there was an error deleting the document. error: ${error}`});
    }
})

app.listen(PORT, () => console.log(`its alive on http:/localhost:${PORT}`));
