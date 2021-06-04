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
const JWTSECRET = "Tihousework_lalaland";
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
const jwt = require('jsonwebtoken');

const ARN = "arn:aws:execute-api:ap-northeast-2:503066724378:*"
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
    if (appkey != APPKEY){
        throw new createError(400,{
            message: 'incorrect appkey',
        });
        
    } 
    if (pass != PASS){
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

    const token = jwt.sign({ email }, JWTSECRET, { expiresIn: "100y" });
    const response = {
        'statusCode': 200,
        'body': JSON.stringify({
            message: "success",
            token : token
        })
    }
    return response
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
    if (appkey != APPKEY){
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



const splitByDelimiter = (data, delim) => {
    const pos = data ? data.indexOf(delim) : -1;
    return pos > 0 ? [data.substr(0, pos), data.substr(pos + 1)] : ["", ""];
    };

const decodeBase64 = (input) =>
    Buffer.from(input, "base64").toString("utf8");

const getReturnPolicy = (allow,email,event) =>{
    return {
        principalId: allow ? email : 'user',
        policyDocument: {
            Version: "2012-10-17",
            Statement: [
                {
                Action: "execute-api:Invoke",
                Effect: allow ? "Allow" : "Deny",
                Resource: allow ? ARN : event.methodArn
                }
            ]
        }
    };
}


const auth = middy(async event => {
    

    console.log(event.methodArn);
    const [type, token] = splitByDelimiter(event.authorizationToken, " ");
    try {
        const decoded = jwt.verify(token, JWTSECRET);
        const email = decoded.email;
        const allow = type === "Bearer" && email;
        return getReturnPolicy(allow,email,event);
    }
    catch{
        return getReturnPolicy(false,null,event);
    }

});

module.exports = { login, register, hello, auth }
