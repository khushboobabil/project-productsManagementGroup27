const jwt = require('jsonwebtoken')
const userModel = require("../models/userModel")


//Authentication................................................................

const authentication = function (req, res, next) {
    try {
        const token = req.headers["authorization"]
        if (!token) {
            return res.status(400).send({ status: false, message: "token must be present" });
        }
        const bearer=token.split(' ')
        const bearerToken=bearer[1]
        const decodedToken = jwt.verify(bearerToken, "Secret-Key");

        if (!decodedToken) {
            return res.status(400).send({ status: false, message: "token is invalid" });
        }
        //req.decodedToken=decodedToken
        next();
    }
    catch (err) {
        console.log(err)
        return res.status(500).send({ msg: err.message })
    }

}


//Authorization.....................................................................

let authorization = async function (req, res, next) {

    try {
        let token = req.headers["authorization"]
        if (!token) { return res.status(400).send({ status: false, message: "token must be present" }) }

        const bearer=token.split(' ')
        const bearerToken=bearer[1]
        const decodedToken = jwt.verify(bearerToken, "Secret-Key");

        if (!decodedToken) {
            return res.status(400).send({ status: false, message: "token is invalid" });
        }

        let decodedUserId = decodedToken.userId
        let userIdParams = req.params.userId

        let userDetailsId = await userModel.findById({ _id: userIdParams })
        if (!userDetailsId) {
            return res.status(401).send({ status: false, msg: "no data found with this Id" });
        }

        let checkUserId = userDetailsId._id

        if (decodedUserId != checkUserId) { return res.status(403).send({ status: false, message: "You are not an authorized person to make these changes" }) }
        next()
    }
    catch (error) {
        console.log(error)
        return res.status(500).send({ msg: error.message })
    }
}


module.exports.authorization = authorization
module.exports.authentication = authentication