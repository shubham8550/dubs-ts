export interface IJSONWord {
    dialog: string
    start_time: number
    end_time: number
    speaker_tag: number
}
export interface ITranslatedTranscript extends IJSONWord {
    translated_dialog: string
}
