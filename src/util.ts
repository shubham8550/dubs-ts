import * as dotenv from 'dotenv' // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
dotenv.config()

export const BUCKETNAME = process.env.BUCKET
export const GCPKEYFILEPATH = process.env.GCPKEYFILEPATH
process.env.GOOGLE_APPLICATION_CREDENTIALS = GCPKEYFILEPATH
