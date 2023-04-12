import { Audio } from "./Audio";

import { Storage } from '@google-cloud/storage';
import { SpeechClient } from '@google-cloud/speech';
import { v4 as uuidv4 } from 'uuid';
import path = require("path");



export class Transcript {
  private audio: Audio;
  private storage: Storage;
  private speechClient: SpeechClient;

  constructor(audio: Audio) {
    this.audio = audio;
    this.storage = new Storage();
    this.speechClient = new SpeechClient();
  }

  public async generateDiarizedTranscript(): Promise<{transcript: string, speakers: string[] ,results:any}> {
    // Upload the audio file to Google Cloud Storage
    const bucketName = '<your-bucket-name>';
    const bucket = this.storage.bucket(bucketName);
    const remoteFilename = `audio/${uuidv4()}_${this.audio.filename}`;
    await bucket.upload(this.audio.filepath, {
      destination: remoteFilename
    });

    // Set up the speech recognition config with diarization
    const config = {
      encoding: 1,
      languageCode: 'en-US',
      enableSpeakerDiarization: true,
      diarizationSpeakerCount: 2, // Set the number of expected speakers
      sampleRateHertz: 16000,
    };

    // Set up the audio input
    const audio = {
      uri: `gs://${bucketName}/${remoteFilename}`,
    };

    // Perform the recognition
    const [response]:any= await this.speechClient.recognize({config, audio});

    // Extract the transcript and speaker information
    const results = response.results;
    const speakers = results
      .map(result => result.speakerTag)
      .filter((value, index, self) => self.indexOf(value) === index)
      .map(tag => `Speaker ${tag}`);
    const transcript = results
      .map(result => result.alternatives[0].transcript)
      .join('\n');

    return {transcript, speakers, results};
  }
}



const main=async ()=>{
let aud= new Transcript(new Audio(path.join("./sample.mp3")))
 console.log(aud.generateDiarizedTranscript());
 

}

main()