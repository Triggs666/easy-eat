import * as AWS from "aws-sdk";
import { Logger } from "winston";
import { createLogger } from "../utils/logger";

export class StorageAccess{
    
  private readonly s3:AWS.S3;
  private readonly logger:Logger;
  private readonly bucketName = process.env.IMAGES_S3_BUCKET;
  private readonly urlExpiration = process.env.SIGNED_URL_EXPIRATION

  constructor(){
    this.s3 = new AWS.S3({signatureVersion: 'v4'});
    this.logger = createLogger('storageLAyer::STORAGE_ACCESS');
  }

  getImageUrl(imageId: string):string {
    
    const imageURL = `https://${this.bucketName}.s3.amazonaws.com/${imageId}`;
    return imageURL; 
  
  }

  getSignedUploadUrl(imageId: string):string {
    
    this.logger.info('Getting upload URL', {imageId});
    const signedURL = this.s3.getSignedUrl('putObject', {
      Bucket: this.bucketName,
      Key: imageId,
      Expires: this.urlExpiration
    });

    this.logger.info('Got upload URL', {URL:signedURL});
    return signedURL 
  
  }

}