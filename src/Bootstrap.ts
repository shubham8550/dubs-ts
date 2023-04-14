import path = require('path')
import { Audio } from './Audio'
import { Video } from './Video'
import { Transcript } from './Transcript'
import { RawSplitSamples } from './RawSplitSamples'
import { TranslatedTranscript } from './TranslatedTranscript'
import { CloneAudioSamples } from './CloneAudioSamples'
import { MergeVideo } from './MergeVideo'

class Bootstrap {
    user_video!: Video
    user_audio!: Audio
    transcript!: Transcript //generate, tanslate, getarray of audio dialogs timings
    translated_transcript!: TranslatedTranscript
    user_raw_split_samples!: RawSplitSamples //array of Audio and place in dubber directory in tortoise so it will be considerd dubber
    generate_clone_audio_samples!: CloneAudioSamples
    embed_cloned_samples_in_raw!: 1
    merge_in_video!: MergeVideo //mearge and save dubbed video

    constructor() {
        this.start()
    }
    start = async () => {
        this.user_video = new Video(path.join('./sample.mp4'))
        this.user_audio = await this.user_video.extractAudio()
        this.transcript = new Transcript(this.user_audio)
        this.translated_transcript = new TranslatedTranscript('hi-in', 'en')
        this.generate_clone_audio_samples = new CloneAudioSamples(
            await this.translated_transcript.translateTranscript(
                await this.transcript.generateDiarizedTranscript()
            )
        )

    }
}

new Bootstrap()
