const AWS = require("aws-sdk")

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

    const fileContent = Buffer.from(event.body, "base64")

    const params = {
      Bucket: "sessionvideos",
      Key: "exvideo.mp4",
      Body: fileContent,
      ContentType: "video/mp4",
    }
    const s3 = new AWS.S3()

    await s3.putObject(params).promise()

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "File uploaded successfully",
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
        error: `Could not upload file: ${error.stack}`,
      }),
    }
  }
}
