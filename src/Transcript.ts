import { Audio } from './Audio'

import { Storage } from '@google-cloud/storage'
import { SpeechClient } from '@google-cloud/speech'
import { v4 as uuidv4 } from 'uuid'
import path = require('path')
import { BUCKETNAME } from './util'
import { Video } from './Video'
import { google } from '@google-cloud/speech/build/protos/protos'

interface IJSONWord {
    dialog: string
    start_time: number
    end_time: number
    speaker_tag: number
}

export class Transcript {
    private audio: Audio
    private storage: Storage
    private speechClient: SpeechClient

    constructor(audio: Audio) {
        this.audio = audio
        this.storage = new Storage()
        this.speechClient = new SpeechClient()
    }

    public async generateDiarizedTranscript(): Promise<IJSONWord[]> {
        // Upload the audio file to Google Cloud Storage
        this.audio = await this.audio.wavAudio()
        const bucketName = BUCKETNAME
        const bucket = this.storage.bucket(bucketName as string)
        const remoteFilename = `audio/${uuidv4()}_${this.audio.filename}`
        await bucket.upload(this.audio.filepath, {
            destination: remoteFilename
        })

        // Set up the speech recognition config with diarization
        const config: google.cloud.speech.v1.IRecognitionConfig = {
            languageCode: 'hi-in',
            enableAutomaticPunctuation: true,
            enableWordTimeOffsets: true,
            speechContexts: [
                {
                    phrases: [],
                    boost: 15
                }
            ],
            useEnhanced: true,
            profanityFilter: true,
            diarizationConfig: {
                enableSpeakerDiarization: true,
                minSpeakerCount: 2,
                maxSpeakerCount: 2
            }
        }

        // Set up the audio input
        const audio = {
            uri: `gs://${bucketName}/${remoteFilename}`
        }

        // Perform the recognition
        const [response] = await this.speechClient.recognize({ config, audio })

        // Extract the transcript and speaker information
        const results = response.results!
        const words = results.flatMap((result) => result.alternatives![0].words!)

        // Combine consecutive words spoken by the same speaker
        const segments: IJSONWord[] = []
        let currentSegment: { dialog: string; start_time: number; end_time: number; speaker_tag: number } | null = null
        for (const word of words) {
            if (!currentSegment) {
                currentSegment = {
                    dialog: word.word!,
                    start_time: Number(word.startTime!.seconds!) + Number(word.startTime!.nanos! / 1e9),
                    end_time: Number(word.endTime!.seconds!) + Number(word.endTime!.nanos! / 1e9),
                    speaker_tag: word.speakerTag!
                }
            } else if (word.speakerTag === currentSegment.speaker_tag) {
                currentSegment.dialog += ` ${word.word}`
                currentSegment.end_time = Number(word.endTime!.seconds!) + word.endTime!.nanos! / 1e9
            } else {
                segments.push(currentSegment)
                currentSegment = {
                    dialog: word.word!,
                    start_time: Number(word.startTime!.seconds!) + word.startTime!.nanos! / 1e9,
                    end_time: Number(word.endTime!.seconds!) + word.endTime!.nanos! / 1e9,
                    speaker_tag: word.speakerTag!
                }
            }
        }
        if (currentSegment) {
            segments.push(currentSegment)
        }

        return segments
    }
}

const main = async () => {
    const aud = new Transcript(await new Video(path.join(__dirname, '..', 'sample.mp4')).extractAudio())
    console.log(await aud.generateDiarizedTranscript())
}

if (require.main === module) {
    main()
}
