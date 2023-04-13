import { exec, spawn } from 'child_process'
import * as fs from 'fs'
import * as os from 'os'
import * as path from 'path'
import { v4 as uuidv4 } from 'uuid'

export class Audio {
    filepath: string
    filename: string
    fileext: string

    constructor(buffer: Buffer)
    constructor(filepath: string)
    constructor(bufferOrPath: Buffer | string) {
        // Create a temporary directory in the root directory
        const tempDir = os.tmpdir()

        if (typeof bufferOrPath === 'string') {
            // If a file path was provided, copy the file to the temporary directory
            const filename = path.basename(bufferOrPath)
            this.filepath = path.join(tempDir, `audio-${uuidv4()}_${filename}`)

            fs.copyFileSync(bufferOrPath, this.filepath)
        } else {
            // If a buffer was provided, create a temporary file in the temporary directory
            const extension = bufferOrPath.slice(0, 2).toString('utf8') === 'RI' ? 'wav' : 'mp3'
            const filename = `audio-${uuidv4()}.${extension}`
            fs.writeFileSync(path.join(tempDir, filename), bufferOrPath)

            this.filepath = path.join(tempDir, filename)
        }

        this.filename = path.basename(this.filepath)
        this.fileext = path.extname(this.filepath).slice(1)
    }
    get buffer(): Buffer {
        return fs.readFileSync(this.filepath)
    }

    mp3(): Promise<Buffer> | Buffer {
        if (this.fileext === 'mp3') {
            // If the file is already in MP3 format, return its contents
            return fs.readFileSync(this.filepath)
        } else {
            // If the file is not in MP3 format, convert it to MP3 format and return the converted contents
            const mp3Path = path.join(path.dirname(this.filepath), `${path.parse(this.filename).name}.mp3`)
            const ffmpeg = spawn('ffmpeg', ['-i', this.filepath, '-q:a', '0', '-map', 'a', mp3Path])
            return new Promise((resolve, reject) => {
                ffmpeg.on('exit', (code, signal) => {
                    if (code !== 0) {
                        reject(new Error(`Failed to convert audio to MP3 format (code ${code}, signal ${signal}).`))
                    } else {
                        resolve(fs.readFileSync(mp3Path))
                    }
                })
            })
        }
    }

    wav(): Promise<Buffer> | Buffer {
        if (this.fileext === 'wav') {
            // If the file is already in WAV format, return its contents
            return fs.readFileSync(this.filepath)
        } else {
            // If the file is not in WAV format, convert it to WAV format and return the converted contents
            const wavPath = path.join(path.dirname(this.filepath), `${path.parse(this.filename).name}.wav`)
            const ffmpeg = spawn('ffmpeg', [
                '-i',
                this.filepath,
                '-acodec',
                'pcm_f32le',
                '-ar',
                '44100',
                '-ac',
                '2',
                wavPath
            ])
            return new Promise((resolve, reject) => {
                ffmpeg.on('exit', (code, signal) => {
                    if (code !== 0) {
                        reject(new Error(`Failed to convert audio to WAV format (code ${code}, signal ${signal}).`))
                    } else {
                        resolve(fs.readFileSync(wavPath))
                    }
                })
            })
        }
    }
    wavAudio(): Promise<Audio> | Audio {
        if (this.fileext === 'wav') {
            // If the file is already in WAV format, return its contents
            return this
        } else {
            // If the file is not in WAV format, convert it to WAV format and return the converted contents
            const wavPath = path.join(path.dirname(this.filepath), `${path.parse(this.filename).name}.wav`)
            fs.exists(wavPath, function (exists) {
                if (exists) {
                    fs.unlinkSync(wavPath)
                }
            })

            const ffmpeg = spawn('ffmpeg', [
                '-i',
                this.filepath,
                '-acodec',
                'pcm_f32le',
                '-ar',
                '44100',
                '-ac',
                '1',
                wavPath
            ])
            return new Promise((resolve, reject) => {
                ffmpeg.on('exit', (code, signal) => {
                    if (code !== 0) {
                        reject(new Error(`Failed to convert audio to WAV format (code ${code}, signal ${signal}).`))
                    } else {
                        resolve(new Audio(wavPath))
                    }
                })
            })
        }
    }

    sampleRate(): Promise<number> | number {
        const ffprobe = spawn('ffprobe', [
            '-v',
            '0',
            '-show_entries',
            'stream=sample_rate',
            '-of',
            'default=noprint_wrappers=1:nokey=1',
            this.filepath
        ])
        return new Promise((resolve, reject) => {
            let sampleRate = 0
            ffprobe.stdout.on('data', (data) => {
                sampleRate = parseInt(data.toString().trim())
            })
            ffprobe.on('exit', (code, signal) => {
                if (code !== 0) {
                    reject(new Error(`Failed to get sample rate (code ${code}, signal ${signal}).`))
                } else {
                    resolve(sampleRate)
                }
            })
        })
    }




    async slowDownAudio(desiredLength: number): Promise<Audio> {
        const inputFile = this.filepath;
        const outputFile = path.join('temp', `slowed-${this.filename}`);
      
        // Delete output file if it already exists
        if (fs.existsSync(outputFile)) {
          fs.unlinkSync(outputFile);
        }
      
        // Use FFmpeg to get duration of input file
        const getDurationCommand = `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 ${this.filepath}`;
        const durationOutput = await new Promise<string>((resolve, reject) => {
        exec(getDurationCommand, (error, stdout, stderr) => {
            if (error) {
            reject(error);
            } else {
            resolve(stdout.trim());
            }
        });
        });
    const currentLength = parseFloat(durationOutput);
    console.log(`Current Duration ${currentLength} => ${desiredLength} `);
    
        const atempo = ( currentLength/ desiredLength);
      console.log(`Tempo ${atempo}`);
      
      
        const ffmpegCommand = `ffmpeg -i ${inputFile} -filter:a "atempo=${atempo}" ${outputFile}`;
      
        return new Promise<Audio>((resolve, reject) => {
          exec(ffmpegCommand, (error, stdout, stderr) => {
            if (error) {
              reject(error);
            } else {
              console.log(`FFmpeg stdout: ${stdout}`);
              console.log(`FFmpeg stderr: ${stderr}`);
              resolve(new Audio(outputFile));
            }
          });
        });
      }
}

// const main=async ()=>{
// let aud= new Audio(path.join("./cloned-raw.wav"))
//  console.log((await aud.slowDownAudio(18)).filepath);
 

// }

// main()


