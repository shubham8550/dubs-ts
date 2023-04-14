import * as dotenv from 'dotenv' // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
dotenv.config()

export const BUCKETNAME = process.env.BUCKET
export const GCPKEYFILEPATH = process.env.GCPKEYFILEPATH
process.env.GOOGLE_APPLICATION_CREDENTIALS = GCPKEYFILEPATH

export const SAMPLETESTRAWTRANSCRIPT = [
    {
        dialog: 'मैं नरेंद्र दामोदरदास मोदी ईश्वर की शपथ लेता हूं कि मैं विधि द्वारा स्थापित भारत के संविधान के प्रति सच्ची श्रद्धा और निष्ठा रखें।',
        start_time: 0,
        end_time: 21,
        speaker_tag: 0
    }
]

export const SAMPLETRANSLATEDTRANSCRIPT = [
    {
        dialog: 'मैं नरेंद्र दामोदरदास मोदी ईश्वर की शपथ लेता हूं कि मैं विधि द्वारा स्थापित भारत के संविधान के प्रति सच्ची श्रद्धा और निष्ठा रखें।',
        translated_dialog:
            'I Narendra Damodardas Modi swear in the name of God to bear true faith and allegiance to the Constitution of India as by law established.',
        start_time: 0,
        end_time: 21,
        speaker_tag: 0
    }
]
