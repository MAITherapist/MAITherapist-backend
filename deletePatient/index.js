const AWS = require("aws-sdk")
const dynamoDb = new AWS.DynamoDB.DocumentClient()

exports.handler = async (event, context) => {
  const id = event.queryStringParameters.id

  const params = {
    TableName: "Patients",
    Key: {
      id: id,
    },
  }

  try {
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
