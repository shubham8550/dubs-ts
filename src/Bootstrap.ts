import path = require("path")
import { Audio } from "./Audio"
import { Video } from "./Video"


class Bootstrap{
    user_video:Video
    user_audio:Audio
    transcript:Transcript//generate, tanslate, getarray of audio dialogs timings
    user_raw_split_samples:RawSplitSamples//array of Audio
    generate_clone_audio_samples:CloneAudioSamples
    embed_cloned_samples_in_raw:EmbadInRaw //ret: Audio (combination of clones)
    merge_in_video:VideoMerge//mearge and save dubbed video

    constructor(){
        this.start()

    }
    start=async ()=>{
        this.user_video=new Video(path.join("./sample.mp4"))
        this.user_audio=await this.user_video.extractAudio()
    }
}

new Bootstrap()