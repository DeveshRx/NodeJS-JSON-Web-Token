

// Connect MongoDB in NodeJS
require("dotenv").config();


const { MongoClient, ObjectId } = require("mongodb");
// Replace the following with your Atlas connection string


// const url =  "mongodb+srv://appuser:devesh@cluster0.dvw6f.mongodb.net/medicine_database?retryWrites=true&w=majority";






var url=process.env.MONGODB_AUTH;




const client = new MongoClient(url);


client.connect();
console.log("Connected to MongoDB server");


function mongoInsert(data) {
  const database = client.db("ExpoDB");
  const med = database.collection("expodb");
  var newVal = { $set: data };


  med.updateOne({ _id: Number(data._id) }, newVal, {
    upsert: true,
  });
}


function mongoUpdate(id, key, value) {
  const database = client.db("medicine_database");
  const med = database.collection("database");
  var newVal = { $set: { [key]: value } };


  med.updateOne({ _id: Number(id) }, newVal, {
    upsert: true,
  });
}


function mongoDelete(id) {
  var DocID = Number(id);


  const database = client.db("medicine_database");
  const med = database.collection("database");


  med.deleteOne({ _id: Number(DocID) });
}


async function mongoGet(db_name, query, options) {
  let db = await client.db(db_name);
  /*  const query = {};
   const options = { "limit": 4 };
   */
  const cursor = await db.collection('products').find(query, options);
  var docs = await cursor.toArray();
  return docs;
}


module.exports = { client, mongoInsert, mongoUpdate, mongoDelete, mongoGet };
