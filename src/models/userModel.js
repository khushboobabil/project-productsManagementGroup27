const mongoose = require("mongoose");


const userSchema = new mongoose.Schema(
  {
    fname: {
      type: String,
      required: true,
      trim: true,
    },
    lname: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      match: [ /^([a-zA-Z0-9\.-]+)@([a-zA-Z0-9-]+).([a-z]+)$/, 'Please fill a valid email address'],
      unique: true,
      
    },
    profileImage:{
      type: String,
      required: true,
      trim: true
    },
    phone: {
      type: String,
      required: true,
      match: [/^[6-9]\d{9}$/, "please fill a valid mobile Number"],
      unique: true,
      trim: true
    },
   
    password: {
      type: String,
      required: true,
      match:[/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,15}$/,'Please enter valid Password'],
      trim: true
    },
    address: {
      shipping:{
      street: {
        type: String,
        required: true,
        trim: true
      },
      city: {
        type: String,
        required: true,
        trim: true
      },
      pincode: {
        type: Number,
        required: true,
        trim: true,
        match:[/^(\d{4}|\d{6})$/,"Please enter valid pincode"]
      },
    },
    billing:{
      street: {
        type: String,
        required: true,
        trim: true
      },
      city: {
        type: String,
        required: true,
        trim: true
      },
      pincode: {
        type: Number,
        required: true,
        match:[/^(\d{4}|\d{6})$/,"Please enter valid pincode"],
        trim: true
      },
    },
  },
  
  },{ timestamps: true }
);

module.exports = mongoose.model("users", userSchema);

// { 
//   fname: {string, mandatory},
//   lname: {string, mandatory},
//   email: {string, mandatory, valid email, unique},
//   profileImage: {string, mandatory}, // s3 link
//   phone: {string, mandatory, unique, valid Indian mobile number}, 
//   password: {string, mandatory, minLen 8, maxLen 15}, // encrypted password
//   address: {
//     shipping: {
//       street: {string, mandatory},
//       city: {string, mandatory},
//       pincode: {number, mandatory}
//     },
//     billing: {
//       street: {string, mandatory},
//       city: {string, mandatory},
//       pincode: {number, mandatory}
//     }
//   },