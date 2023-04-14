import { exec, spawn } from 'child_process'
import * as fs from 'fs'
import * as os from 'os'
import * as path from 'path'
import { v4 as uuidv4 } from 'uuid'

import { Audio } from './Audio'
import { Video } from './Video'

export class MergeVideo {
    private readonly tempDir = os.tmpdir()

    constructor(private video: Video, private audio: Audio) {}

    public async merge(): Promise<string> {
        const outputFilePath = path.join(this.tempDir, `output-${uuidv4()}.mp4`)

        let command = `ffmpeg -y -hide_banner -loglevel error -i "${this.video.filepath}"`

        const audioPath = path.join(this.tempDir, `audio-${uuidv4()}.wav`)
        fs.writeFileSync(audioPath, await this.audio.wav())
        command += ` -i "${audioPath}" -filter_complex "[0:v:0] [1:a:0] concat=n=1:v=1:a=1 [v] [a]" -map "[v]" -map "[a]" "${outputFilePath}"`

        return new Promise((resolve, reject) => {
            exec(command, (error, stdout, stderr) => {
                if (error) {
                    reject(error)
                } else {
                    resolve(outputFilePath)
                }
            })
        })
    }

    public cleanup(): void {
        fs.rmdirSync(this.tempDir, { recursive: true })
    }
}
