import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3"
import "react-native-get-random-values";
import "react-native-url-polyfill/auto";
import * as FileSystem from 'expo-file-system'

const options = {
  bucket: "kuky-video",
  region: "ap-southeast-1"
}

let credentials = {
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
}

const client = new S3Client({
  region: options.region,
  credentials: credentials
})

const AWSHelper = {
  uploadFile: async function (path, name) {
    try {
      const videoData = await FileSystem.readAsStringAsync(path, { encoding: FileSystem.EncodingType.Base64 });

      const params = {
        Bucket: 'kuky-video',
        Key: name,
        Body: videoData,
        ContentEncoding: 'base64',
        ContentType: 'video/mp4',
        ACL: 'public-read-write'
      }
      const command = new PutObjectCommand(params)
      const response = await client.send(command)
      console.log(response)
      return response
    } catch (error) {
      console.log(error);
      return null
    }
  },
}

export default AWSHelper; 