const AWS = require("aws-sdk")
const { CognitoJwtVerifier } = require("aws-jwt-verify")
const dynamoDb = new AWS.DynamoDB.DocumentClient()
// Verifier that expects valid access tokens:
const verifier = CognitoJwtVerifier.create({
  userPoolId: process.env.userPoolId,
  tokenUse: "access",
  clientId: process.env.clientId,
})
exports.handler = async (event, context) => {
  try {
    if (event.httpMethod === "OPTIONS") {
      return {
        statusCode: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET,OPTIONS",
          "Access-Control-Allow-Headers":
            "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token",
        },
        body: "",
      }
    }

    const therapistId = event.queryStringParameters.therapistId
    // Get the JWT token from the Authorization header
    const token = event.headers["Authorization"].split(" ")[1]

    const payload = await verifier.verify(token)
    if (payload.username !== therapistId) {
      return {
        statusCode: 401,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Credentials": true,
        },
        body: JSON.stringify({
          error: `Unauthorized`,
        }),
      }
    }

    const params = {
      TableName: "Patients",
      FilterExpression: "therapistId = :therapistId",
      ExpressionAttributeValues: {
        ":therapistId": therapistId,
      },
    }

    try {
      const result = await dynamoDb.scan(params).promise()
      return {
        statusCode: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Credentials": true,
        },
        body: JSON.stringify(result.Items),
      }
    } catch (error) {
      return {
        statusCode: 500,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Credentials": true,
        },
        body: JSON.stringify({
          error: `Could not retrieve patients: ${error.stack}`,
        }),
      }
    }
  } catch (error) {
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
        "Access-Control-Allow-Headers":
          "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token",
      },
      body: JSON.stringify({
        error: `Could not retrieve patients: ${error.stack}`,
      }),
    }
  }
}
