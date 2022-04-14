
const productModel = require("../models/productModel")
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

const isValid = function (value) {
    if (typeof value == undefined || value == null) return false
    if (typeof value === 'string' && value.trim().length === 0) return false
    if (typeof value === 'Number' && value.toString().trim().length === 0) return false
    return true
}

const isValidObjectId = function (objectId) {
    return mongoose.Types.ObjectId.isValid(objectId)
}


// create review.....................................................................
const createProduct = async function (req, res) {
    try {
        let data = req.body;
        if (!(Object.keys(data).length > 0)) {
            return res.status(400).send({ status: false, message: "Invalid request Please provide details of an user" });
        }

        const { title, description, price, currencyId, currencyFormat, productImage, style, availableSizes} = data;

        if (!isValid(title)) {
            return res.status(400).send({ status: false, message: "please provide title" });
        }

        if (!isValid(description)) {
            return res.status(400).send({ status: false, message: "please provide description" });
        }

        if (!isValid(price)) {
            return res.status(400).send({ status: false, message: "price is required" });
        }

        if (!isValid(currencyId)) {
            return res.status(400).send({ status: false, message: "currencyId is required" });
        }
        if (!isValid(currencyFormat)) {
            return res.status(400).send({ status: false, message: "please provide currencyFormat" });
        }

        // if (!productImage) {
        //     return res.status(400).send({ status: false, message: "ProductImage is required" });
        // }
        let files = req.files 
   
    if (files && files.length > 0) {
        let productImage = await uploadFile(files[0])    

        let savedData = await productModel.create({ title, description, price, currencyId, currencyFormat, productImage, style, availableSizes});

        return res.status(201).send({ status: true, data: savedData });
    }
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }
};
module.exports.createProduct = createProduct

//get with filter............................................
const filterProducts = async (req, res) => {
    try{
        const queryData = req.query
        let filter = { isDeleted:false }
       
        const { size, name, priceGreaterThan, priceLessThan, sortPrice } = queryData;
        if(isValid(size)){
            filter["availableSizes"]=size
        }
        let arr=[]
        if(isValid(name)){
          
        const findName=await productModel.find({isDeleted:false}).select({title:1,_id:0})
        for(let i=0;i<findName.length;i++)
        {
            let findingName=findName[i].title
            let newSize=findingName.includes(name)

            if(newSize)
            {
               arr.push(findName[i].title)
            }
        }
      filter["title"]=name
    }

    if(priceGreaterThan!=null && priceLessThan==null )
    {
      filter["price"]={$gt:priceGreaterThan}
    }

    if(priceGreaterThan==null && priceLessThan!=null )
    {
      filter["price"]={$lt:priceLessThan}
    }

    if(priceGreaterThan!=null && priceLessThan!=null )
    {
      filter["price"]={$gt:priceGreaterThan,$lt:priceLessThan}
    }
    
    if(sortPrice==1){
       let findPrice=await productModel.find(filter).sort({price:1})
       if(findPrice.length==0)
       {
           return res.status(404).send({status:false,message:"data not found"})
       }
       return res.status(200).send({status:true,data:findPrice})
    }
    if(sortPrice==-1){
        let findPrice=await productModel.find(filter).sort({price:-1})
        if(findPrice.length==0)
        {
            return res.status(404).send({status:false,message:"data not found"})
        }
        return res.status(200).send({status:true,data:findPrice})
     }
 
     let findPrice=await productModel.find(filter)
        if(findPrice.length==0)
        {
            return res.status(404).send({status:false,message:"data not found"})
        }
        return res.status(200).send({status:true,data:findPrice})
    
    }
    catch(error){
        return res.status(500).json({ status: false, message: error.message });
    }
}
module.exports.filterProducts = filterProducts


//get Product................................................
const getProduct = async function (req, res) {
    try {
        const productId = req.params.productId

        if (!(isValid(productId) || isValidObjectId(productId))) {
        return res.status(400).send({ status: false, message: "ProductId is invalid" })}

        const productDetails = await productModel.findOne({ _id: productId, isDeleted: false })

        if (!productDetails) { return res.status(404).send({ status: false, message: "No data found" }) }

        return res.status(200).send({ status: true, message: "Book Data", data: productDetails })
    }

    catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }


}
module.exports.getProduct = getProduct


//update product........................................................

const updateProduct = async function (req, res) {
    try {
        let data = req.body;
        //if (!(Object.keys(data).length > 0)) { return res.status(400).send({ status: false, message: "Invalid request Please provide details of an user" }); }

        let productId = req.params.productId
        if (!(isValid(productId) || isValidObjectId(productId))) {
            return res.status(400).send({ status: false, message: "ProductId is invalid" })
        }
        let { title, description, price, currencyId, currencyFormat, productImage,availableSizes } = req.body
        const dataObject = {};
        if (isValid(title)) {
            dataObject['title'] = fname.trim()
        }

        if (isValid(description)) {
            dataObject['description'] = fname.trim()
        }

        if (isValid(price))  {
            dataObject['price'] = fname.trim()
        }


        if (isValid(currencyId)) {
            dataObject['currencyId'] = fname.trim()
        }

        if (isValid(currencyFormat))  {
            dataObject['currencyFormat'] = fname.trim()
        }
        let file = req.files
        if (file.length > 0) {
            let uploadFileUrl = await uploadFile(file[0])
            dataObject['productImage'] = uploadFileUrl
        }
  

        let updatedProduct = await productModel.findOneAndUpdate({ productId },
             dataObject,
            { new: true })

            if (!updatedProduct) {
                return res.status(404).send({ status: false, msg: "user profile not found" })
            }
            return res.status(200).send({ status: true, msg: "User Profile updated", data: updatedProduct })
      

    } catch (error) {
        res.status(500).send({ status: false, msg: error.message });
    }
}
module.exports.updateProduct = updateProduct



//delete product................................................

const deleteProduct = async function (req, res) {
    try {

        let deleteProductId = req.params.productId
        if (!(isValid(deleteProductId) || isValidObjectId(deleteProductId))) {
            return res.status(400).send({ status: false, message: "ProductId is invalid" })
        }

        const findProductById = await productModel.findOne({ _id: deleteProductId, isDeleted: false })

        if (!findProductById) {
            return res.status(404).send({ status: false, message: "No product Available,Already deleted" })
        }


        const deleteProductData = await productModel.findOneAndUpdate({ _id: deleteProductId },
            { $set: { isDeleted: true } },
            { new: true })

        if (!deleteProductData) {
            return res.status(404).send({ status: false, msg: "Not Found" })
        }

        return res.status(200).send({ status: true, message: "Product deleted successfullly." })


    }
    catch (error) {
        console.log(error)
       return res.status(500).send({ status: false, message: error.message });
    }


}

module.exports.deleteProduct = deleteProduct