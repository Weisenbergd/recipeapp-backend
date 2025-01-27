import aws from "aws-sdk";
import { randomBytes } from "crypto";

import dotenv from "dotenv";

dotenv.config();

const region = "us-east-1";
const bucketName = "weisenberg-recipeapp";
const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

const s3 = new aws.S3({
  region,
  accessKeyId,
  secretAccessKey,
  signatureVersion: "v4",
});

export async function S3Delete(key: string) {
  const params = {
    Bucket: bucketName,
    Key: key,
  };

  await s3.deleteObject(params).promise();
  console.log("Image deleted from S3: ", key);
}

export async function S3URL(folder: string) {
  const rawBytes = await randomBytes(16);
  const imageName = rawBytes.toString("hex");

  const params = {
    Bucket: bucketName + "/" + folder,
    Key: imageName,
    // Expires: 3600,
  };

  const uploadURL = await s3.getSignedUrlPromise("putObject", params);

  return uploadURL;
}
