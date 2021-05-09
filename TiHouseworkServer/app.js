// const axios = require('axios')
// const url = 'http://checkip.amazonaws.com/';
let response;

/**
 *
 * Event doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html#api-gateway-simple-proxy-for-lambda-input-format
 * @param {Object} event - API Gateway Lambda Proxy Input Format
 *
 * Context doc: https://docs.aws.amazon.com/lambda/latest/dg/nodejs-prog-model-context.html 
 * @param {Object} context
 *
 * Return doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html
 * @returns {Object} object - API Gateway Lambda Proxy Output Format
 * 
 */
exports.lambdaHandler = async (event, context) => {
    console.log("hahaha")
    try {
        // const ret = await axios(url);
        response = {
            'statusCode': 200,
            'body': JSON.stringify({
                message: 'hello world',
                // location: ret.data.trim()
            })
        }
    } catch (err) {
        console.log(err);
        return err;
    }

    return response
};

const middy = require('@middy/core');
const httpErrorHandler = require('@middy/http-error-handler');
const errorLogger = require('@middy/error-logger');
const createError = require('http-errors');
/*
Login user. if login success, return token.
No auth required

@api {post} /user/login 
@param {String} useremail
@return {Boolean} status 
        {String} token 
*/ 
const login = middy(async (event, context, callback) => {
    // try {
        const  payload = JSON.parse(event.body)
        const email = payload.email;
        const pass = payload.pass; 

        if (!email || !pass ) {
            throw new createError.BadRequest({message: 'Missing required property'});
        } 

        response = {
            'statusCode': 200,
            'body': JSON.stringify({
                message: "success",
                // location: ret.data.trim()
            })
        }
    return response
});

login
    .use(errorLogger())
    .use(httpErrorHandler())

module.exports = { login }

/*
Register user. if register success, return status true.
No auth required

@api {post} /user/register 
@param {String} useremail
@return {Boolean} status 
*/
exports.register = async (event, context) => {

    
};