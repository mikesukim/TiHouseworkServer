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
const lambdaHandler = async (event, context) => {
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
        const email = payload.email;
        const pass = payload.pass; 

        if (!email || !pass ) {
            throw new createError.BadRequest({message: 'Missing required property'});
        } 

        const response = {
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

/*
Register user. if register success, return status true.
No auth required

@api {post} /user/register 
@param {String} email
@return {Boolean} status 
*/
const register = middy(async (event, context, callback) => {

    const payload = JSON.parse(event.body)
    const email = payload.email;

    if (!email) {
        throw new createError.BadRequest({message: 'Missing required property'});
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
        console.log(err);
        throw new createError.BadRequest({message: err});
    }

    const response = {
        'statusCode': 200,
        'body': JSON.stringify({
            message: "success",
            // location: ret.data.trim()
        })
    }
    return response;



    
    await db.put(params, function(err, data) {
        if (err) {
            console.log("hey")
            // console.error("Unable to add item. Error JSON:", JSON.stringify(err, null, 2));
            console.error(error);
        } else {
            console.log("Added item:", JSON.stringify(data, null, 2));
            const response = {
                'statusCode': 200,
                'body': JSON.stringify({
                    message: "success",
                    // location: ret.data.trim()
                })
            }
            return response
        }
    });
});

register
    .use(errorLogger())
    .use(httpErrorHandler())


module.exports = { lambdaHandler, login, register }