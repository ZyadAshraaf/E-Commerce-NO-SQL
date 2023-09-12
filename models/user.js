const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema({
    email: {
        type: String,
        required: true
    },
    password:{
        type : String,
        required : true
    },
    resetToken : String,
    resetTokenExpiration : Date,
    cart: {
        items: [{
            productId: {
                type: Schema.Types.ObjectId,
                ref: 'Product',
                required: true
            },
            quantity: {
                type: Number,
                required: true
            }
        }]
    }

});

userSchema.methods.addToCart = function (product) {

    const cartProductInex = this.cart.items.findIndex(cp => {
        return cp.productId.toString() === product._id.toString();
    });
    let newQuantity = 1;
    const updatedCartItems = [...this.cart.items]
    if (cartProductInex >= 0) {
        newQuantity = this.cart.items[cartProductInex].quantity + 1;
        updatedCartItems[cartProductInex].quantity = newQuantity;
    } else {
        updatedCartItems.push({
            productId: product._id,
            quantity: newQuantity
        })
    }
    const updatedCart = {
        items: updatedCartItems
    };
    this.cart = updatedCart;
    return this.save();


}


userSchema.methods.removeFromCart = function (productId) {
    const updatedCartItems = this.cart.items.filter(item => {
        return item.productId.toString() !== productId.toString();
    });
    this.cart.items = updatedCartItems;
    return this.save();
}

userSchema.methods.clearCart = function(){
    this.cart={items:[]};
    return this.save();
}
module.exports = mongoose.model("User", userSchema);




















// const mongodb = require('mongodb');

// const mongoConnect = require("../util/database");
// const getDb = mongoConnect.getDb;

// class User {
//     constructor(name, email, cart, _id) {
//         this.name = name;
//         this.email = email;
//         this.cart = cart; //{cart : items : []}
//         this._id = _id ? new mongodb.ObjectId(_id) : null;
//     }

//     save() {
//         const db = getDb();
//         return db.collection("users").insertOne(this);

//     }

//     addToCart(product) {
//         const cartProductInex = this.cart.items.findIndex(cp => {
//             return cp.productId.toString() === product._id.toString();
//         });
//         let newQuantity = 1;
//         const updatedCartItems = [...this.cart.items]
//         if (cartProductInex >= 0) {
//             newQuantity = this.cart.items[cartProductInex].quantity + 1;
//             updatedCartItems[cartProductInex].quantity = newQuantity;
//         } else {
//             updatedCartItems.push({
//                 productId: new mongodb.ObjectId(product._id),
//                 quantity: newQuantity
//             })
//         }
//         const updatedCart = {
//             items: updatedCartItems
//         };
//         const db = getDb();
//         let filter = {
//             _id: this._id
//         };
//         let update = {
//             $set: {
//                 cart: updatedCart
//             }
//         };
//         return db.collection('users').updateOne(filter, update);

//     }

//     getCart() {
//         const db = getDb();
//         const productsIds = this.cart.items.map(i => {
//             return i.productId;
//         });
//         return db.collection("products").find({
//                 _id: {
//                     $in: productsIds
//                 }
//             }).toArray()
//             .then(products => {
//                 return products.map(product => {
//                     return {
//                         ...product,
//                         quantity: this.cart.items.find(i => {
//                             return i.productId.toString() === product._id.toString();
//                         }).quantity
//                     }
//                 })
//             })
//     }

//     deletedItemFromCart(productId) {
//         const updatedCartItems = this.cart.items.filter(item => {
//             return item.productId.toString() !== productId.toString();
//         });
//         console.log(updatedCartItems);
//         const db = getDb();
//         let filter = {
//             _id: this._id
//         };
//         let update = {
//             $set: {
//                 cart: {
//                     items: updatedCartItems
//                 }
//             }
//         }
//         return db.collection("users").updateOne(filter, update);

//     }


//     addOrder() {
//         const db = getDb();
//         return this.getCart()
//             .then(products => {
//                 let order = {
//                     items: products,
//                     user: {
//                         _id: this._id,
//                         name: this.name
//                     }
//                 }

//                 return db.collection("orders").insertOne(order)
//                     .then(result => {
//                         this.cart.items = [];
//                         let filter = {
//                             _id: this._id
//                         };
//                         let update = {
//                             $set: {
//                                 cart: {
//                                     items: []
//                                 }
//                             }
//                         }
//                         return db.collection("users").updateOne(filter, update);

//                     })
//                     .catch(err => console.log(err));
//             })
//     }

//     getOrders(){
//         const db = getDb();
//         let filter = {
//             'user._id' : this._id 
//         };
//         return db.collection("orders").find(filter).toArray();
//     }

//     static findById(id) {
//         const db = getDb();
//         let filter = {
//             _id: new mongodb.ObjectId(id)
//         };
//         return db.collection('users').findOne(filter);
//     }
// }

// module.exports = User;