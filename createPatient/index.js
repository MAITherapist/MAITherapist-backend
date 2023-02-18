const AWS = require("aws-sdk")
const dynamoDb = new AWS.DynamoDB.DocumentClient()

exports.handler = async (event, context) => {
  const patient = JSON.parse(event.body)

  const params = {
    TableName: "Patients",
    Item: patient,
  }

  try {
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
      body: JSON.stringify({
        error: `Could not create patient: ${error.stack}`,
      }),
    }
  }
}
