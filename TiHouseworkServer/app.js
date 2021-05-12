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
const APPKEY = "TiHousework_lala"
const PASS = 1234

const { DynamoDB } = require('aws-sdk');
const option = {
    endpoint : "http://docker.for.mac.localhost:8000"
}
const db = new DynamoDB.DocumentClient(process.env.AWS_SAM_LOCAL ? option : null);
const userTable = process.env.USER_TABLE;

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
    const payload = JSON.parse(event.body)
    const appkey = payload.appkey;
    const email = payload.email;
    const pass = payload.pass; 

    if (!email || !pass || !appkey) {
        throw new createError.BadRequest({message: 'Missing required property'});
    } 
    if (appkey != APPKEY){
        throw new createError.BadRequest({message: 'incorrect appkey'});
    } 
    if (pass != PASS){
        throw new createError.BadRequest({message: 'incorrect pass'});
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
       console.log(data)
       if (!data.Item){
            console.log("should be here")
            throw new createError.BadRequest("no data exist");  
       }
    }
    catch(err)
    {
        throw new createError.BadRequest({message: err.message});
    }


    const response = {
        'statusCode': 200,
        'body': JSON.stringify({
            message: "success",
        })
    }
    return response
});

login
    .use(errorLogger())
    .use(httpErrorHandler())

/*
Register user. if register success, return status true.
No auth required

@api {post} /user/register 
@param {String} email
@return {Boolean} status 
*/
const register = middy(async (event, context, callback) => {

    const payload = JSON.parse(event.body)
    const appkey = payload.appkey;
    const email = payload.email;

    if (!email || !appkey) {
        throw new createError.BadRequest({message: 'Missing required property'});
    }
    if (appkey != APPKEY){
        throw new createError.BadRequest({message: 'incorrect appkey'});
    } 

    const params = {
        TableName: userTable,
        Item: {
            "email":  email
        },
        ConditionExpression: "attribute_not_exists(email)"
    }

    try
    {
        await db.put(params).promise();
    }
    catch(err)
    {
        throw new createError.BadRequest({message: err.message});
    }

    const response = {
        'statusCode': 200,
        'body': JSON.stringify({
            message: "success",
            // location: ret.data.trim()
        })
    }
    return response;
});

register
    .use(errorLogger())
    .use(httpErrorHandler())


module.exports = { login, register }