const AWS = require("aws-sdk")
const dynamoDb = new AWS.DynamoDB.DocumentClient()
const { CognitoJwtVerifier } = require("aws-jwt-verify")
const verifier = CognitoJwtVerifier.create({
  userPoolId: process.env.userPoolId,
  tokenUse: "access",
  clientId: process.env.clientId,
})
exports.handler = async (event, context) => {
  const session = JSON.parse(event.body)
  function generateUUID() {
    // Public Domain/MIT
    var d = new Date().getTime() //Timestamp
    var d2 =
      (typeof performance !== "undefined" &&
        performance.now &&
        performance.now() * 1000) ||
      0 //Time in microseconds since page-load or 0 if unsupported
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
      var r = Math.random() * 16 //random number between 0 and 16
      if (d > 0) {
        //Use timestamp until depleted
        r = (d + r) % 16 | 0
        d = Math.floor(d / 16)
      } else {
        //Use microseconds since page-load if supported
        r = (d2 + r) % 16 | 0
        d2 = Math.floor(d2 / 16)
      }
      return (c === "x" ? r : (r & 0x3) | 0x8).toString(16)
    })
  }
  const params = {
    TableName: "Sessions",
    Item: {...session, id: generateUUID()},
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
      body: JSON.stringify({ message: "Session created successfully" }),
    }
  } catch (error) {
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
      },
      body: JSON.stringify({
        error: `Could not create session: ${error.stack}`,
      }),
    }
  }
}
