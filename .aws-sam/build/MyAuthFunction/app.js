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

const middy = require('@middy/core');
const jwt = require('jsonwebtoken');
const ARN = "arn:aws:execute-api:ap-northeast-2:503066724378:*"

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
        const decoded = jwt.verify(token, credentials.JWTSECRET);
        const email = decoded.email;
        const allow = type === "Bearer" && email;
        return getReturnPolicy(allow,email,event);
    }
    catch{
        return getReturnPolicy(false,null,event);
    }

});

module.exports = { auth }
