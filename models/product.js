const mongoose  = require("mongoose");

const Schema = mongoose.Schema;

const productSchema = new Schema({
  title : {
    type : String,
    required : true
  },
  price : {
    type : String,
    required :  true
  },
  description : {
    type : String,
    required :  true
  },
  imageUrl : {
    type : String,
    required :  true
  },
  userId:{
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
});






module.exports = mongoose.model('Product', productSchema);

















// const mongodb = require('mongodb');

// const mongoConnect = require("../util/database");
// const getDb = mongoConnect.getDb;


// class Product {
//   constructor(id,title, price, description, imageUrl , userId) {
//     this._id = id ? new mongodb.ObjectId(id) : null;
//     this.title = title;
//     this.price = price;
//     this.description = description;
//     this.imageUrl = imageUrl;
//     this.userId = userId;
//   }

//   save() {
//     const db = getDb();
//     let dbOp ;
//     if(this._id){
//       const filter ={_id : this._id}
//       const updatedProduct = {$set : this};
//       dbOp = db.collection('products').updateOne(filter, updatedProduct);

//     }else{
//       dbOp = db.collection('products').insertOne(this)
//     }
//     return dbOp
//     .then(result => {
//         console.log(result);
//       })
//       .catch(err => {
//         console.log(err);
//       });
//   }

//   update(){
//     const db = getDb();
//     const filter ={_id : this._id}
//     const updatedProduct = {$set : this};
//     return db.collection('products').updateOne(filter, updatedProduct);
    
//   }

//   static deleteById(id){
//     const db = getDb();
//     let filter = {_id : new mongodb.ObjectId(id)}
//     return db.collection('products').deleteOne(filter);

//   }

//   static fetchAll(){
//     const db = getDb();
//     return db.collection('products').find().toArray()
//     .then(products=>{
//       return products;
//     })
//     .catch(err=>console.log(err));
//   }

//   static findById(id){
//     const prodId = new mongodb.ObjectId(id);
//     const db = getDb();
//     return db.collection('products').find({_id:prodId}).next()
//     .then(product=>{
//       return product
//     })
//     .catch(err=> console.log(err));
//   }
  

// }

// module.exports = Product;
