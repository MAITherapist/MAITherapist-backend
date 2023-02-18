const AWS = require("aws-sdk")
const dynamoDb = new AWS.DynamoDB.DocumentClient()
const { CognitoJwtVerifier } = require("aws-jwt-verify")
const verifier = CognitoJwtVerifier.create({
  userPoolId: process.env.userPoolId,
  tokenUse: "access",
  clientId: process.env.clientId,
})
exports.handler = async (event, context) => {
  const id = event.queryStringParameters.id

  const params = {
    TableName: "Patients",
    Key: {
      id: id,
    },
  }

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
    const result = await dynamoDb.get(params).promise()
    if (!result.Item) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: `Patient with ID ${id} not found` }),
      }
    }

    if (payload.username !== result.Item.therapistId) {
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

    await dynamoDb.delete(params).promise()
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: `Patient with ID ${id} deleted successfully`,
      }),
    }
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: `Could not delete patient with ID ${id}: ${error.stack}`,
      }),
    }
  }
}
