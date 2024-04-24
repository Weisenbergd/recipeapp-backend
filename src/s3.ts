import aws from "aws-sdk";
import { randomBytes } from "crypto";

const region = "us-east-1";
const bucketName = "weisenberg-recipeapp";
const accessKeyId = process.env.ACCESSKEYID;
const secretAccessKey = process.env.SECRETACCESSKEY;

const s3 = new aws.S3({
  region,
  accessKeyId,
  secretAccessKey,
  signatureVersion: "v4",
});

export async function S3URL(folder: string) {
  console.log("folder", folder);

  const rawBytes = await randomBytes(16);
  const imageName = rawBytes.toString("hex");

  const params = {
    Bucket: bucketName + "/" + folder,
    Key: imageName,
    // Expires: 3600,
  };

  console.log(bucketName + "/" + folder);

  const uploadURL = await s3.getSignedUrlPromise("putObject", params);
  return uploadURL;
}
