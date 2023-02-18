const AWS = require("aws-sdk")
const dynamoDb = new AWS.DynamoDB.DocumentClient()
const { CognitoJwtVerifier } = require("aws-jwt-verify")
const verifier = CognitoJwtVerifier.create({
  userPoolId: process.env.userPoolId,
  tokenUse: "access",
  clientId: process.env.clientId,
})
exports.handler = async (event, context) => {
  const patient = JSON.parse(event.body)

  const params = {
    TableName: "Patients",
    Item: patient,
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

    await verifier.verify(token)

    await dynamoDb.put(params).promise()
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
      },
      body: JSON.stringify({ message: "Patient created successfully" }),
    }
  } catch (error) {
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
      },
      body: JSON.stringify({
        error: `Could not create patient: ${error.stack}`,
      }),
    }
  }
}
