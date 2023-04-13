import { Translate } from "@google-cloud/translate/build/src/v2";
import { SAMPLETESTRAWTRANSCRIPT } from "./util";

interface IJSONWord {
    dialog: string
    start_time: number
    end_time: number
    speaker_tag: number
}
export interface ITranslatedTranscript extends IJSONWord {
  translated_dialog: string;
}

export class TranslatedTranscript {
  private readonly translate: Translate;

  constructor(private readonly sourceLanguage: string, private readonly targetLanguage: string) {
    this.translate = new Translate();
  }

  async translateTranscript(transcript: IJSONWord[]): Promise<ITranslatedTranscript[]> {
    const translatedTranscripts: ITranslatedTranscript[] = [];

    for (const word of transcript) {
      const [translations] = await this.translate.translate(word.dialog, {
        from: this.sourceLanguage,
        to: this.targetLanguage,
      });
      const translatedWord = Array.isArray(translations) ? translations[0] : translations;

      translatedTranscripts.push({
        dialog: word.dialog,
        translated_dialog: translatedWord,
        start_time: word.start_time,
        end_time: word.end_time,
        speaker_tag: word.speaker_tag

      });
    }

    return translatedTranscripts;
  }
}


const main = async () => {
  const aud = new TranslatedTranscript('hi','en')
  console.log(await aud.translateTranscript(SAMPLETESTRAWTRANSCRIPT))
}

if (require.main === module) {
  main()
}
