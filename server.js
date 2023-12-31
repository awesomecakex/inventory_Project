const express = require("express");
const app = express();
const { MongoClient } = require('mongodb');
const PORT = 5000;
const url = 'mongodb://mongo:27017';
const dbName = "Project";
const collectionName = "inventory";



app.use(express.json())


async function connectToDatabase() {
  try {
    const client = new MongoClient(url);
    await client.connect();
    const db = client.db(dbName);
    console.log('Connected to MongoDB');
    return db;
  } catch (error) {
    console.error('Failed to connect to MongoDB', error);
    throw error;
  }
}
let inventory = undefined;
(async () => {
    const db = await connectToDatabase();
    inventory = db.collection('inventory');
})()

app.get('/items', async (req,res) => {
    try{
        const cursor = inventory.find();
        const docs = await cursor.toArray();
        for (i in docs){
            delete docs[i]["_id"];
        }
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
        delete docs[0]["_id"];
        res.status(200).json(docs);
        }catch(error){
        res.status(500).send({error_message:`An error was raised while executing ${error}`});
    }
});

app.post('/items', async (req,res) => {
    try{
        const id = Date.now().toString(36) + Math.random().toString(36);
        const {name, amount} = req.body;
        const item_document = {'id':id,'name':name,'amount':amount};
        await inventory.insertOne(document);
        const item_string = `{"id":"${id}", "name":"${name}", "amount":${amount}}`.replace(/[\\"]/g, '');
        res.status(200).send({message:`Document id ${id} was added Succesfully. The document added: ${item_string}. `});
    }catch(error){
        res.status(500).send({error_message:`There was an error adding the item you sent ${error}` });
    }
})
app.patch('/items/:id', async (req, res) => {
    try{
        const {id} = req.params;
        const filter = {id:id};
        const update_command = {$set:{}};
        if(req.body.name) update_command.$set.name = req.body.name;
        if(req.body.amount) update_command.$set.amount = req.body.amount;
        await inventory.updateOne(filter, update_command);
        const query = {id:id};
        const cursor = inventory.find(query);
        let docs = await cursor.toArray();
        delete docs[0]["_id"];
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
