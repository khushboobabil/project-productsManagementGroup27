const userModel = require("../models/userModel")
const jwt = require("jsonwebtoken")
const aws = require("aws-sdk")
const mongoose = require("mongoose")

//Connection to  AWS
aws.config.update(
  {
      accessKeyId: "AKIAY3L35MCRVFM24Q7U",
      secretAccessKey: "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",
      region: "ap-south-1"
  }
)

//uploading An Image File to AWS
let uploadFile = async (file) => {
  return new Promise(function (resolve, reject) {

      let s3 = new aws.S3({ apiVersion: "2006-03-01" })

      var uploadParams = {
          ACL: "public-read",
          Bucket: "classroom-training-bucket",
          Key: "khushboo/" + file.originalname,
          Body: file.buffer
      }
      console.log(uploadFile)
      s3.upload(uploadParams, function (err, data) {
          if (err) {
              return reject({ "error": err })
          }

          return resolve(data.Location)
      }
      )

  }
  )
}


//validation
const isValid = function(value){
  if(typeof value ==undefined ||  value ==null)return false
  if(typeof value==='string'&&value.trim().length===0) return false
  if(typeof value===Number &&value.trim().length===0) return false
  return true
}


const isValidObjectId = function (ObjectId) {
  return mongoose.Types.ObjectId.isValid(ObjectId)
}


//Create user.....................................................................
const createUser = async function (req, res) {
  try {

    let data =req.body;  

    if (!(Object.keys(data).length > 0)) { return res.status(400).send({ status: false, message: "Invalid request Please provide details of an user" }) }

    const {fname,lname,email,phone,password,address} = data;
   
    if (!isValid(fname)){ return res.status(400).send({ status: false, message: "please provide first name" }) }
   
    if (!isValid(lname)) { return res.status(400).send({ status: false, message: "please provide first name" }) }
    
    if (!isValid(email)) { return res.status(400).send({ status: false, message: "Email-Id is required" }) }

    if (!(/^([a-zA-Z0-9\.-]+)@([a-zA-Z0-9-]+).([a-z]+)$/.test(email.trim()))) {
      return res.status(400).send({ status: false, message: "Email should be a valid email address" })
    }

    let checkEmail = await userModel.findOne({ email: email })
    if (checkEmail) { return res.status(400).send({ message: "Email Already exist" }) }

    //if (!profileImage) { return res.status(400).send({ status: false, message: "please provide profileImages" }) }

    if (!isValid(phone)) { return res.status(400).send({ status: false, message: "Phone Number is required" }) }


    if (!(/^[6-9]\d{9}$/.test(phone))) {
      return res.status(400).send({ status: false, message: "phone number should be valid Indian number" })
    }

    let checkPhone = await userModel.findOne({ phone: phone })
    if (checkPhone) { return res.status(400).send({ message: "This phone number already exist" }) }

    if (!isValid(password)) {
      return res.status(400).send({ status: false, message: "Password is required" })
    }

    if (!(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,15}$/.test(password.trim()))) {
      return res.status(400).send({ status: false, message: "Minimum eight characters, at least one uppercase letter, one lowercase letter, one number and one special character" })
    }

    if (!isValid(address["shipping"]["street"])) { return res.status(400).send({ status: false, message: "please provide Street Name for shipping address"}) }
    if (!isValid(address["shipping"]["city"])) { return res.status(400).send({ status: false, message: "please provide City name for shipping address" }) }


    if (!(/^(\d{4}|\d{6})$/.test(address["shipping"]["pincode"]))) {
      return res.status(400).send({ status: false, message: "Please enter valid Pincode for shipping address" })
    }

    if (!isValid(address["billing"]["street"])) { return res.status(400).send({ status: false, message: "please provide street name for billing address" }) }

    if (!isValid(address["billing"]["city"])) { return res.status(400).send({ status: false, message: "please provide  city name for billing address" }) }

    if (!(/^(\d{4}|\d{6})$/.test(address["billing"]["pincode"]))) {return res.status(400).send({ status: false, message: "Please enter valid Pincode for billing address" })}

    let files = req.files 
   
    if (files && files.length > 0) {
        let profileImage = await uploadFile(files[0])    

    const output = await userModel.create({fname,lname,email,profileImage,phone,password, address})

    const finalData = {fname:output.fname,lname:output.lname,email:output.email,profileImage:output.profileImage,phone:output.phone,password:output.password, address:output.address}

    return res.status(201).json({ status: true,message: "User created successfully", data: finalData })
    } else {
      return res.status(400).send({ msg: "No file found" })
    }
  }
  catch (error) {
    return res.status(500).send({ status: false, message: error.message })
  }
}




//login..........................................................................................

const login = async function (req, res) {

  try {
    let data = req.body
    if (!(Object.keys(data).length > 0)) { return res.status(400).send({ status: false, message: "Invalid request Please provide details of an User" }) }

    let email = req.body.email;
    if (!isValid(email)) { return res.status(400).send({ status: false, message: "Email-Id is required" }) }

    if (!(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email))) {
      return res.status(400).send({ status: false, message: "Email should be a valid email address" })
    }
    let password = req.body.password;

    if (!isValid(password)) {
      return res.status(400).send({ status: false, message: "Password is required" })
    }

    if (!(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,16}$/.test(password))) {
      return res.status(400).send({ status: false, message: "Please Enter Password : Minimum eight characters, at least one uppercase letter, one lowercase letter, one number and one special character" })
    }

    let loginUser = await userModel.findOne({ email: email, password: password });

    if (!loginUser) return res.status(404).send({status: false,logInFailed: "No user found with this credentials,please check your email or password"});

   
    let token = jwt.sign(
      {
        userId:loginUser._id,
      },
      "Secret-Key", { expiresIn: "2hr" },
    );
    //res.header('Authorization ', token);
    return res.status(200).send({ status: true,message:"User login successfull",data:{usedId:`${loginUser._id}`,token: token }});
  }

  catch (error) {
    return res.status(500).send({ status: false, message: error.message })
  }
}


//get user ......................................................................

const getUser = async function (req, res) {

  try {
    const userId = req.params.userId
    if (!(isValid(userId))) { return res.status(400).send({ status: false, message: "userId is required" }) }

    if (!isValidObjectId(userId)) { return res.status(400).send({ status: false, message: "Valid userId is required" }) }
   
      const oneUser = await userModel.findOne({_id:userId})
      if (!oneUser)
      return res.status(400).send({status: false, Data: "No data found with this userId"});

      return res.status(200).send({ status: true, message:"User profile updated", data: oneUser })
   
  }
  catch (error) {
    return res.status(500).send({ status: false, message: error.message })
  }
}

//updates.................................................................................

const updateUser = async (req, res) => {

  try {
    const data = req.body
    if (!(Object.keys(data).length > 0)) { return res.status(400).send({ status: false, message: "Invalid request Please provide details of an User to be updated" }) }

    const userId = req.params.userId

    if (!(isValid(userId))) { return res.status(400).send({ status: false, message: "userId is required" }) }
    if (!isValidObjectId(userId)) { return res.status(400).send({ status: false, message: "Valid userId is required" }) }

    const {fname,lname,email,profileImage,phone,password,address} = data;

   
    //  if (!(/^([a-zA-Z0-9\.-]+)@([a-zA-Z0-9-]+).([a-z]+)$/.test(email))) {
    //   return res.status(400).send({ status: false, ERROR: "email is not valid" })
    //  }

    // const emailNew = await userModel.findOne({ email: email});
    // if (emailNew) { return res.status(400).send({ status: false, message: "Email  already registered" }) }

    
     if (!(/^[6-9]\d{9}$/.test(phone))) {
      return res.status(400).send({ status: false, message: "phone is not valid" })}

    const phoneNew = await userModel.findOne({ phone: phone});
    if (phoneNew) { return res.status(400).send({ status: false, message: "phone  already registered" }) }

    if (!(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,16}$/.test(password))) {
      return res.status(400).send({ status: false, message: "Please Enter Password : Minimum eight characters, at least one uppercase letter, one lowercase letter, one number and one special character" })
    }

    let ifExist = await userModel.findOne({ _id: userId })

    if (!ifExist) {
      return res.status(400).send({ status: false, message: "User Not Found" })
    }

      let updatedBook = await userModel.findOneAndUpdate({ _id: userId },
        {
          ...data
        },
        { new: true })

      return res.status(200).send({ Status: true, message: "User profile updated", data: updatedBook })
    }
  
    catch (error) {
      return res.status(500).send({ status: false, message: error.message })
    }
}

module.exports.createUser = createUser
module.exports.login = login
module.exports.getUser = getUser
module.exports.updateUser = updateUser





