const AWS = require("aws-sdk")

const s3 = new AWS.S3({
  accessKeyId: process.env.accessKeyId,
  secretAccessKey: process.env.secretAccessKey,
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

    const fileName = JSON.parse(event.body).fileName
    const fileType = JSON.parse(event.body).fileType
    let params = {
      Bucket: "sessionvideos",
      Key: decodeURIComponent(fileName),
      ContentType: decodeURIComponent(fileType),
      ACL: "public-read-write",
      Expires: 6000,
      // ServerSideEncryption: 'AES256' // <-- uncomment to add server-side encryption
    }

    const url = await s3.getSignedUrlPromise("putObject", params)

    return {
      statusCode: 200,
      body: JSON.stringify({ uploadUrl: url }),
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
      },
    }
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
      },
    }
  }
}
