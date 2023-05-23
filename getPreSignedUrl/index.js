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
    const type = JSON.parse(event.body).fileName.split(".")[1]
    const fileName = generateUUID() + "." + type
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
      body: JSON.stringify({
        uploadUrl: url,
        fileName: fileName,
        fileType: fileType,
      }),
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
