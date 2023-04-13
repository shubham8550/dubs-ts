import { spawn } from 'child_process';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

export class Audio {
  filepath: string;
  filename: string;
  fileext: string;

  constructor(buffer: Buffer);
  constructor(filepath: string);
  constructor(bufferOrPath: Buffer | string) {
    // Create a temporary directory in the root directory
    const tempDir = path.join( 'temp')

    if (typeof bufferOrPath === 'string') {
      // If a file path was provided, copy the file to the temporary directory
      const filename = path.basename(bufferOrPath);
      this.filepath = path.join(tempDir,  `audio-${uuidv4()}_${filename}`);

      fs.copyFileSync(bufferOrPath, this.filepath);

    } else {
      // If a buffer was provided, create a temporary file in the temporary directory
      const extension = bufferOrPath.slice(0, 2).toString('utf8') === 'RI' ? 'wav' : 'mp3';
      const filename = `audio-${uuidv4()}.${extension}`;
      fs.writeFileSync(path.join(tempDir, filename), bufferOrPath);

      this.filepath = path.join(tempDir, filename);
    }

    this.filename = path.basename(this.filepath);
    this.fileext = path.extname(this.filepath).slice(1);
  }
  get buffer(): Buffer {
    return fs.readFileSync(this.filepath);
  }

  mp3(): Promise<Buffer> | Buffer {
    if (this.fileext === 'mp3') {
      // If the file is already in MP3 format, return its contents
      return fs.readFileSync(this.filepath);
    } else {
      // If the file is not in MP3 format, convert it to MP3 format and return the converted contents
      const mp3Path = path.join(path.dirname(this.filepath), `${path.parse(this.filename).name}.mp3`);
      const ffmpeg = spawn('ffmpeg', ['-i', this.filepath, '-q:a', '0', '-map', 'a', mp3Path]);
      return new Promise((resolve, reject) => {
        ffmpeg.on('exit', (code, signal) => {
          if (code !== 0) {
            reject(new Error(`Failed to convert audio to MP3 format (code ${code}, signal ${signal}).`));
          } else {
            resolve(fs.readFileSync(mp3Path));
          }
        });
      });
    }
  }

   wav(): Promise<Buffer> | Buffer {
    if (this.fileext === 'wav') {
      // If the file is already in WAV format, return its contents
      return fs.readFileSync(this.filepath);
    } else {  // If the file is not in WAV format, convert it to WAV format and return the converted contents
        const wavPath = path.join(path.dirname(this.filepath), `${path.parse(this.filename).name}.wav`);
        const ffmpeg = spawn('ffmpeg', ['-i', this.filepath, '-acodec', 'pcm_s16le', '-ar', '44100', '-ac', '2', wavPath]);
        return new Promise((resolve, reject) => {
          ffmpeg.on('exit', (code, signal) => {
            if (code !== 0) {
              reject(new Error(`Failed to convert audio to WAV format (code ${code}, signal ${signal}).`));
            } else {
              resolve(fs.readFileSync(wavPath));
            }
          });
        });
      }

    }
    wavAudio(): Promise<Audio> | Audio {
      if (this.fileext === 'wav') {
        // If the file is already in WAV format, return its contents
        return this
      } else {  // If the file is not in WAV format, convert it to WAV format and return the converted contents
          const wavPath = path.join(path.dirname(this.filepath), `${path.parse(this.filename).name}.wav`);
          fs.exists(wavPath, function(exists) {
            if(exists) {
              fs.unlinkSync(wavPath);
            } 
          });

          const ffmpeg = spawn('ffmpeg', ['-i', this.filepath, '-acodec', 'pcm_s16le', '-ar', '44100', '-ac', '1', wavPath]);
          return new Promise((resolve, reject) => {
            ffmpeg.on('exit', (code, signal) => {
              if (code !== 0) {
                reject(new Error(`Failed to convert audio to WAV format (code ${code}, signal ${signal}).`));
              } else {
                resolve(new Audio(wavPath));
              }
            });
          });
        }
  
      }

     sampleRate(): Promise<number> | number {
      const ffprobe = spawn('ffprobe', ['-v', '0', '-show_entries', 'stream=sample_rate', '-of', 'default=noprint_wrappers=1:nokey=1', this.filepath]);
      return new Promise((resolve, reject) => {
        let sampleRate = 0;
        ffprobe.stdout.on('data', (data) => {
          sampleRate = parseInt(data.toString().trim());
        });
        ffprobe.on('exit', (code, signal) => {
          if (code !== 0) {
            reject(new Error(`Failed to get sample rate (code ${code}, signal ${signal}).`));
          } else {
            resolve(sampleRate);
          }
        });
      });
    }

      
}


// const main=async ()=>{
// let aud= new Audio(path.join("./sample.mp3"))
//  aud.wav

// }

// main()