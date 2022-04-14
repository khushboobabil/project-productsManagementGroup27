const userModel = require("../models/userModel")
const jwt = require("jsonwebtoken")
const bcrypt = require("bcrypt");
const saltRound = 10;
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
var uploadFile = async (file) => {
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
const isValid = function (value) {
  if (typeof value == undefined || value == null) return false
  if (typeof value === 'string' && value.trim().length === 0) return false
  if (typeof value === Number && value.trim().length === 0) return false
  return true
}


const isValidObjectId = function (ObjectId) {
  return mongoose.Types.ObjectId.isValid(ObjectId)
}


//Create user.....................................................................
const createUser = async function (req, res) {
  try {

    let data = req.body;
    let address = JSON.parse(data.address)

    if (!(Object.keys(data).length > 0)) { return res.status(400).send({ status: false, message: "Invalid request Please provide details of an user" }) }

    var { fname, lname, email, phone, password } = data;

    if (!isValid(fname)) { return res.status(400).send({ status: false, message: "please provide first name" }) }

    if (!isValid(lname)) { return res.status(400).send({ status: false, message: "please provide first name" }) }

    if (!isValid(email)) { return res.status(400).send({ status: false, message: "Email-Id is required" }) }

    if (!(/^([a-zA-Z0-9\.-]+)@([a-zA-Z0-9-]+).([a-z]+)$/.test(email.trim()))) {
      return res.status(400).send({ status: false, message: "Email should be a valid email address" })
    }

    let checkEmail = await userModel.findOne({ email: email })
    if (checkEmail) { return res.status(400).send({ message: "Email Already exist" }) }

    //if (profileImage) { return res.status(400).send({ status: false, message: "please provide profileImages" }) }

    if (!isValid(phone)) { return res.status(400).send({ status: false, message: "Phone Number is required" }) }


    if (!(/^[6-9]\d{9}$/.test(phone))) {
      return res.status(400).send({ status: false, message: "phone number should be valid Indian number" })
    }

    let checkPhone = await userModel.findOne({ phone: phone })
    if (checkPhone) { return res.status(400).send({ message: "This phone number already exist" }) }

    if (!isValid(password)) {
      return res.status(400).send({ status: false, message: "Password is required" })
    }

    if (!(password.length >= 8 && password.length <= 15)) { return res.status(400).send({ status: false, message: 'Please enter Password minlen 8 and maxlenth15' }) }
    
    let hash=await bcrypt.hash(password,10)





    if (!isValid(address.shipping.street)) { return res.status(400).send({ status: false, message: "please provide Street Name for shipping address" }) }
    if (!isValid(address["shipping"]["city"])) { return res.status(400).send({ status: false, message: "please provide City name for shipping address" }) }


    if (!(/^(\d{4}|\d{6})$/.test(address["shipping"]["pincode"]))) {
      return res.status(400).send({ status: false, message: "Please enter valid Pincode for shipping address" })
    }

    if (!isValid(address.billing.street)) { return res.status(400).send({ status: false, message: "please provide street name for billing address" }) }

    if (!isValid(address["billing"]["city"])) { return res.status(400).send({ status: false, message: "please provide  city name for billing address" }) }

    if (!(/^(\d{4}|\d{6})$/.test(address["billing"]["pincode"]))) { return res.status(400).send({ status: false, message: "Please enter valid Pincode for billing address" }) }

    let files = req.files

    if (files.length > 0) {
      var profileImage = await uploadFile(files[0])}
      // data.profileImage = image
       //password = await bcrypt.hash(password, saltRound);

      let output = await userModel.create({ fname, lname, email, phone,profileImage:profileImage, password:hash, address })

      //var finalData = { fname: output.fname, lname: output.lname, email: output.email, profileImage: output.profileImage, phone: output.phone, password: output.password,address:output.address }

      return res.status(201).json({ status: true, message: "User created successfully", data: output })
    // } else {
    //   return res.status(400).send({ msg: "No file found" })
    // }
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

    let loginUser = await userModel.findOne({ email: email});

    if (!loginUser) return res.status(404).send({ status: false, logInFailed: "No user found with this credentials,please check your email or password" });
    let rightPassword = await bcrypt.compare(password,loginUser.password);
    

    if (!rightPassword) return res.status(400).send({ status: false, message: "password is incorrect" });

    let token = jwt.sign(
      {
        userId: loginUser._id,
      },
      "Secret-Key", { expiresIn: "2hr" },
    );
    //res.header('Authorization ', token);
    return res.status(200).send({ status: true, message: "User login successfull", data: { usedId: `${loginUser._id}`, token: token } });
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

    const oneUser = await userModel.findOne({ _id: userId })
    if (!oneUser)
      return res.status(400).send({ status: false, Data: "No data found with this userId" });

    return res.status(200).send({ status: true, message: "User profile updated", data: oneUser })

  }
  catch (error) {
    return res.status(500).send({ status: false, message: error.message })
  }
}


const updateUserProfile = async function (req, res) {
  try {
      const userId = req.params.userId
      if (!isValid(userId)) {
          return res.status(400).send({ status: false, msg: "userId is required" })
      }
      if (!isValidObjectId(userId)) {
          return res.status(400).send({ status: false, msg: "userId is invalid" })
      }
      let { fname, lname, email, phone, password, address } = req.body
      const dataObject = {};
      if (Object.keys(req.body) == 0) {
          return res.status(400).send({ status: false, msg: "enter data to update" })
      }
      if (isValid(fname)) {
          dataObject['fname'] = fname.trim()
      }
      if (isValid(lname)) {
          dataObject['lname'] = lname.trim()
      }
      if (isValid(email)) {
          let findMail = await userModel.findOne({ email: email })
          if (findMail) {
              return res.status(400).send({ status: false, msg: "this email is already register" })
          }
          dataObject['email'] = email.trim()
      }
      if (isValid(phone)) {
          let findPhone = await userModel.findOne({ phone: phone })
          if (findPhone) {
              return res.status(400).send({ status: false, msg: "this mobile number is already register" })
          }
          dataObject['phone'] = phone.trim()
      }
      if (isValid(password)) {
          if (!password.length >= 8 && password.length <= 15) {
              return res.status(400).send({ status: false, msg: "password length should be 8 to 15" })
          }
          let saltRound = 10
          const hash = await bcrypt.hash(password, saltRound)
          dataObject['password'] = hash
      }
      let file = req.files
      if (file.length > 0) {
          let uploadFileUrl = await uploadFile(file[0])
          dataObject['profileImage'] = uploadFileUrl
      }

      if (address) {
          address = JSON.parse(address)
          if (isValid(address.shipping)) {
              if (isValid(address.shipping.street)) {

                  dataObject['address.shipping.street'] = address.shipping.street
              }
              if (isValid(address.shipping.city)) {

                  dataObject['address.shipping.city'] = address.shipping.city
              }
              if (isValid(address.shipping.pincode)) {
                  if (typeof address.shipping.pincode !== 'number') {
                      return res.status(400).send({ status: false, message: 'please enter pinCode in digit' })
                  }
                  dataObject['address.shipping.pincode'] = address.shipping.pincode
              }
          }

          if (isValid(address.billing)) {
              if (isValid(address.billing.street)) {

                  dataObject['address.billing.street'] = address.billing.street
              }
              if (isValid(address.billing.city)) {

                  dataObject['address.billing.city'] = address.billing.city
              }
              if (isValid(address.billing.pincode)) {
                  if (typeof address.billing.pincode !== 'number') {
                      return res.status(400).send({ status: false, message: ' Please provide pincode in number' })
                  }
                  dataObject['address.billing.pincode'] = address.billing.pincode
              }
          }
      }
      const updateProfile = await userModel.findOneAndUpdate({ userId }, dataObject , { new: true })
      if (!updateProfile) {
          return res.status(404).send({ status: false, msg: "user profile not found" })
      }
      return res.status(200).send({ status: true, msg: "User Profile updated", data: updateProfile })

  }
  catch (err) {
      return res.status(500).send({ status: false, msg: err.message })
  }
}

module.exports.createUser = createUser
module.exports.login = login
module.exports.getUser = getUser
module.exports.updateUserProfile = updateUserProfile