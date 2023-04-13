import path = require('path')
import { Audio } from './Audio'
import { Video } from './Video'
import { Transcript } from './Transcript'
import { RawSplitSamples } from './RawSplitSamples'
import { TranslatedTranscript } from './TranslatedTranscript'

class Bootstrap {
    user_video!: Video
    user_audio!: Audio
    transcript!: Transcript //generate, tanslate, getarray of audio dialogs timings
    translated_transcript!:TranslatedTranscript
    user_raw_split_samples!: RawSplitSamples //array of Audio and place in dubber directory in tortoise so it will be considerd dubber 
    generate_clone_audio_samples!: 1
    embed_cloned_samples_in_raw!: 1 //ret: Audio (combination of clones)
    merge_in_video!: 1 //mearge and save dubbed video

    constructor() {
        this.start()
    }
    start = async () => {
        this.user_video = new Video(path.join('./sample.mp4'))
        this.user_audio = await this.user_video.extractAudio()
        this.transcript= 
    }
}

new Bootstrap()
