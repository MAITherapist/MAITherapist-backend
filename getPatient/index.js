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

    const token = event.headers["Authorization"].split(" ")[1]

    const payload = await verifier.verify(token)

    const id = event.queryStringParameters.id

    const params = {
      TableName: "Patients",
      Key: {
        id: id,
      },
    }

    try {
      const result = await dynamoDb.get(params).promise()
      if (!result.Item) {
        return {
          statusCode: 404,
          body: JSON.stringify({ error: `Patient with ID ${id} not found` }),
        }
      }
      if (result?.Item?.therapistId !== payload.username) {
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
      return {
        statusCode: 200,
        body: JSON.stringify(result.Item),
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Credentials": true,
        },
      }
    } catch (error) {
      return {
        statusCode: 500,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Credentials": true,
        },
        body: JSON.stringify({
          error: `Could not retrieve patient with ID ${id}: ${error.stack}`,
        }),
      }
    }
  } catch (error) {
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
      },
      body: JSON.stringify({
        error: `Could not fetch patient: ${error.stack}`,
      }),
    }
  }
}
