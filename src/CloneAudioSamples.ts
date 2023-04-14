import { exec } from 'child_process'
import path from 'path'
import { Audio } from './Audio'
import { ITranslatedTranscript } from './interfaces'
const fs = require('fs')
export class CloneAudioSamples {
    constructor(public transcript: ITranslatedTranscript[]) {}
    public start() {}

    tts(textfile: string, voice: string = 'dubber', preset: string = 'fast'): Promise<Audio> {
        const colonedAudDir = path.join('./results', 'longform', voice)

        if (fs.existsSync(colonedAudDir) && fs.readdirSync(colonedAudDir).length > 0) {
            fs.readdirSync(colonedAudDir).forEach((file: string) => {
                const filePath = path.join(colonedAudDir, file)
                fs.unlinkSync(filePath)
            })
        }

        const command = `conda activate base && python C:\\Users\\shubh\\anaconda3\\tortoise-tts\\tortoise\\read.py --textfile ${textfile} --voice ${voice} --preset ${preset}`
        return new Promise<Audio>((resolve, reject) => {
            exec(command, (error, stdout, stderr) => {
                if (error) {
                    reject(error)
                } else {
                    resolve(new Audio(path.join(colonedAudDir, 'combined.wav')))
                }
            })
        })
    }
}
