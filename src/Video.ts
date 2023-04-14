import * as fs from 'fs'
import * as path from 'path'
import { spawn } from 'child_process'
import { v4 as uuidv4 } from 'uuid'
import { Audio } from './Audio'
import { tmpdir } from 'os'

export class Video {
    filepath: string
    filename: string
    fileext: string

    constructor(buffer: Buffer)
    constructor(filepath: string)
    constructor(bufferOrPath: Buffer | string) {
        // Create a temporary directory in the root directory
        const tempDir = tmpdir()

        if (typeof bufferOrPath === 'string') {
            // If a file path was provided, copy the file to the temporary directory
            const filename = path.basename(bufferOrPath)
            this.filepath = path.join(tempDir, `video-${uuidv4()}_${filename}`)
            fs.copyFileSync(bufferOrPath, this.filepath)
        } else {
            // If a buffer was provided, create a temporary file in the temporary directory
            const extension = bufferOrPath.slice(4, 8).toString('utf8') === 'ftyp' ? 'mp4' : 'mov'
            const filename = `video-${uuidv4()}.${extension}`
            fs.writeFileSync(path.join(tempDir, filename), bufferOrPath)

            this.filepath = path.join(tempDir, filename)
        }

        this.filename = path.basename(this.filepath)
        this.fileext = path.extname(this.filepath).slice(1)
    }

    get buffer(): Buffer {
        return fs.readFileSync(this.filepath)
    }

    async extractAudio(): Promise<Audio> {
        const audioPath = path.join(path.dirname(this.filepath), `temp-audio-${path.parse(this.filename).name}.mp3`)
        fs.exists(audioPath, function (exists) {
            if (exists) {
                fs.unlinkSync(audioPath)
            }
        })
        const ffmpeg = spawn('ffmpeg', [
            '-i',
            this.filepath,
            '-vn',
            '-acodec',
            'libmp3lame',
            '-q:a',
            '0',
            '-f',
            'mp3',
            audioPath
        ])
        return new Promise((resolve, reject) => {
            ffmpeg.on('exit', (code, signal) => {
                if (code !== 0) {
                    reject(new Error(`Failed to extract audio from video (code ${code}, signal ${signal}).`))
                } else {
                    resolve(new Audio(audioPath))
                }
            })
        })
    }
}

const main = async () => {
    let aud = new Video(path.join('./sample.mp4'))
    await aud.extractAudio()
}

if (require.main === module) {
    main()
}
