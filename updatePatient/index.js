const AWS = require("aws-sdk")
const dynamoDb = new AWS.DynamoDB.DocumentClient()
const { CognitoJwtVerifier } = require("aws-jwt-verify")
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

    const patient = JSON.parse(event.body)
    const id = patient.id

    const getUserParam = {
      TableName: "Patients",
      Key: {
        id: id,
      },
    }

    const result = await dynamoDb.get(getUserParam).promise()
    if (!result.Item) {
      return {
        statusCode: 404,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Credentials": true,
        },
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

    const params = {
      TableName: "Patients",
      Key: {
        id: id,
      },
      UpdateExpression:
        "set #name = :name, #age = :age, #gender = :gender, #analysis = :analysis, #sessions = :sessions",
      ExpressionAttributeNames: {
        "#name": "name",
        "#age": "age",
        "#gender": "gender",
        "#analysis": "analysis",
        "#sessions": "sessions",
      },
      ExpressionAttributeValues: {
        ":name": patient.name,
        ":age": patient.age,
        ":gender": patient.gender,
        ":analysis": patient.analysis,
        ":sessions": patient.sessions,
      },
      ReturnValues: "UPDATED_NEW",
    }

    await dynamoDb.update(params).promise()
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: `Patient with ID ${id} updated successfully`,
      }),
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
        error: `Could not update patient with ID ${id}: ${error.stack}`,
      }),
    }
  }
}
