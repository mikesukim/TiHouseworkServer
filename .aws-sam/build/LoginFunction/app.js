// const axios = require('axios')
// const url = 'http://checkip.amazonaws.com/';


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

const credentials = require('./credentials.js');

const { DynamoDB } = require('aws-sdk');
const option = {
    endpoint : "http://docker.for.mac.localhost:8000"
}
const db = new DynamoDB.DocumentClient(process.env.AWS_SAM_LOCAL ? option : null);
const userTable = process.env.USER_TABLE;

const middy = require('@middy/core');
const httpErrorHandler = require('@middy/http-error-handler');
const createError = require('http-errors');
const jwt = require('jsonwebtoken');

const admin = require("firebase-admin");
const serviceAccount = require("./tihousework-a3b37-firebase-adminsdk-2fdg4-d551168729.json");
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

/*
Test function. 
@api {get} /hello
@return {String} message 
*/
const hello = middy(async (event, context, callback) => {
    const response = {
        'statusCode': 200,
        'body': JSON.stringify({
            message: "hello world",
        })
    }
    return response
});

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
    const payload = JSON.parse(event.body)
    const appkey = payload.appkey;
    const email = payload.email;
    const pass = payload.pass; 

    if (!email || !pass || !appkey) {
        throw new createError(400,{
            message: 'Missing required property',
        });
    } 
    if (appkey != credentials.APPKEY){
        throw new createError(400,{
            message: 'incorrect appkey',
        });
        
    } 
    if (pass != credentials.APPPASS){
        throw new createError(400,{
            message: 'incorrect pass',
        });
        
    }

    const params = {
        TableName: userTable,
        Key: {
            "email": email,
        },
        AttributesToGet: [
            "email"
        ],
    }
    
    try
    {
       const data = await db.get(params).promise();
       if (!data.Item){
            throw new createError(400,{
                message: "no data exist",
            });
       }
    }
    catch(err)
    {
        throw new createError(400,{
            message: "no id exist",
        });
    }

    // const token = jwt.sign({ email }, credentials.JWTSECRET, { expiresIn: "100y" });
    // const response = {
    //     'statusCode': 200,
    //     'body': JSON.stringify({
    //         message: "success",
    //         token : token
    //     })
    // }

    // return response

    try {
        const token = await admin
        .auth()
        .createCustomToken(email)

        const response = {
            'statusCode': 200,
            'body': JSON.stringify({
                message: "hoho",
                token : token
            })
        }

        return response;    
    }
    catch(error){
        console.log('Error creating custom token:', error);
        throw new createError(400,{
            message: "Error creating firebase custom token",
        });
    }


    // await admin
    //     .auth()
    //     .createCustomToken(email)
    //     .then((customToken) => {
    //     // Send token back to client
    //         const response = {
    //             'statusCode': 200,
    //             'body': JSON.stringify({
    //                 message: "hoho",
    //                 token : customToken
    //             })
    //         }
    //     })
    //     .catch((error) => {
    //         console.log('Error creating custom token:', error);
    //         throw new createError(400,{
    //             message: "Error creating firebase custom token",
    //         });
    //     });
});




login
    .use(httpErrorHandler())

/*
Register user. if register success, return status true.
No auth required

@api {post} /user/register 
@param {String} useremail
@return {Boolean} status 
*/
const register = middy(async (event, context, callback) => {

    const payload = JSON.parse(event.body)
    const appkey = payload.appkey;
    const email = payload.email;

    if (!email || !appkey) {
        throw new createError(400,{
            message: 'Missing required property',
        });
    }
    if (appkey != credentials.APPKEY){
        // throw new createError.BadRequest({message: 'incorrect appkey'});
        throw new createError(400,{
            message: 'incorrect appkey',
        });
    } 

    const params = {
        TableName: userTable,
        Item: {
            "email":  email
        },
        ConditionExpression: "attribute_not_exists(email)"
    }

    const response = {
        'statusCode': 200,
        'body': JSON.stringify({
            message: "success",
            // location: ret.data.trim()
        })
    }

    try
    {
        await db.put(params).promise();
    }
    catch(err)
    {
        throw new createError(400,{
            message: err.message,
        });
        // throw new createError.Conflict();
    }

    return response;
});

register
    .use(httpErrorHandler())


module.exports = { login, register, hello }
