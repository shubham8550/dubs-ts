import { Audio } from "./Audio";

import { Storage } from '@google-cloud/storage';
import { SpeechClient } from '@google-cloud/speech';
import { v4 as uuidv4 } from 'uuid';
import path = require("path");
import { BUCKETNAME } from "./util";
import { Video } from "./Video";
import { google } from "@google-cloud/speech/build/protos/protos";



export class Transcript {
  private audio: Audio;
  private storage: Storage;
  private speechClient: SpeechClient;

  constructor(audio: Audio) {
    this.audio = audio;
    this.storage = new Storage();
    this.speechClient = new SpeechClient();
  }

  public async generateDiarizedTranscript(): Promise<{transcript: string, speakers: string[] }> {
    // Upload the audio file to Google Cloud Storage
    this.audio=await this.audio.wavAudio()
    const bucketName = BUCKETNAME;
    const bucket = this.storage.bucket(bucketName);
    const remoteFilename = `audio/${uuidv4()}_${this.audio.filename}`;
    await bucket.upload(this.audio.filepath, {
      destination: remoteFilename
    });

    // Set up the speech recognition config with diarization
    const config:google.cloud.speech.v1.IRecognitionConfig = {
     

      languageCode: 'hi-in',
      enableAutomaticPunctuation: true,
      enableWordTimeOffsets:true,
      speechContexts:[{
        phrases:[],
        boost:15
      }],
      useEnhanced: true,
      profanityFilter:true,

     // audioChannelCount:2,
      diarizationConfig : {
        enableSpeakerDiarization: false,
    }
  };

    // Set up the audio input
    const audio = {
      uri: `gs://${bucketName}/${remoteFilename}`,
    };

    // Perform the recognition
    const [response]:any= await this.speechClient.recognize({config, audio});

    // Extract the transcript and speaker information
    const results = response.results;
    
    console.log(results.map(result => result.alternatives[0].transcript));
    console.log("-------------------------------------");

    
    const speakers = results
      .map(result => result.speakerTag)
      .filter((value, index, self) => self.indexOf(value) === index)
      .map(tag => `Speaker ${tag}`);
    const transcript = results
      .map(result => result.alternatives[0].transcript)
      .join('\n');

    return {transcript, speakers};
  }
}



const main=async ()=>{
let aud= new Transcript(await new Video("./sample.mp4").extractAudio())
 console.log(await aud.generateDiarizedTranscript());
 

}

main()