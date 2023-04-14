import path from 'path'
import { Audio } from './Audio'
import { Video } from './Video'

const fs = require('fs')
const { execSync } = require('child_process')

export class RawSplitSamples {
    constructor(
        public audio: Audio,
        public segment_time = 9,
        public tortoiseVoicesDir = path.join('C:\\Users\\shubh\\anaconda3\\tortoise-tts\\tortoise\\voices\\dubber')
    ) {
        this.write()
    }

    async write() {
        // If the tortoise voices directory is not empty, empty it first
        if (fs.existsSync(this.tortoiseVoicesDir) && fs.readdirSync(this.tortoiseVoicesDir).length > 0) {
            fs.readdirSync(this.tortoiseVoicesDir).forEach((file: string) => {
                const filePath = path.join(this.tortoiseVoicesDir, file)
                fs.unlinkSync(filePath)
            })
        }

        // Create segments of the audio file
        const command = `ffmpeg -i ${
            (await this.audio.wavAudio()).filepath
        } -f segment -c:a pcm_f64le -ar 22050 -segment_time ${this.segment_time} -c copy ${path.join(
            this.tortoiseVoicesDir,
            'out%03d.wav'
        )}`
        execSync(command)
    }
}

//ffmpeg -i .\sample.mp3 -f segment -segment_time 9 -c copy out%03d.wav

const main = async () => {
    let d = new RawSplitSamples(await new Video(path.join(__dirname, '..', 'sample.mp4')).extractAudio())
}

if (require.main === module) {
    main()
}
