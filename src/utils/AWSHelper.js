import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3"
import "react-native-get-random-values";
import "react-native-url-polyfill/auto";

const options = {
  keyPrefix: "uploads/",
  bucket: "kuky-video-transcribe",
  region: "ap-southeast-1",
  successActionStatus: 201
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
  uploadFile: async function(path, name, type){
    try {
      const file = {
        uri:  `file://${path}`,
        name: name,
        type: type
      }

      await client.send(new PutObjectCommand({ Bucket: "camera-sec", Key: 'uploads/' + file.name, Body: file, }) ).then(response => {
       console.log(response)
      }).catch((error) => { console.log(error)})
      return true
    } catch (error) {
      console.log(error);
    }
  }, 
}

export default AWSHelper; 