export const dataset = {
  eyebrow: "Dataset",
  title: "Comorian Voice Dataset",
  seoTitle: "Dataset",
  seoDescription: "Download the OpenShikomori speech dataset. Free, open-source audio data for Shikomori language AI research.",
  subtitle: "Explore our growing collection of Comorian speech data, freely available for research and development.",
  stats: {
    speakers: "Contributors",
    speakersDesc: "Unique voices in the dataset",
    clips: "Audio Clips",
    clipsDesc: "Validated recordings",
    hours: "Total Hours",
    hoursDesc: "Of Comorian speech",
    languages: "Languages",
    languagesDesc: "Comorian variants supported",
  },
  progress: {
    title: "Collection Progress",
    comorian: "Shikomori (Ngazidja)",
    comorianHours: "65 hours / 100 target",
    french: "Comorian French",
    frenchHours: "42 hours / 100 target",
    arabic: "Comorian Arabic",
    arabicHours: "28 hours / 100 target",
  },
  datasets: {
    title: "Download Datasets",
    updated: "Last updated",
    download: "Download",
    commonvoice: {
      name: "Common Voice Format",
      description: "Full dataset in Mozilla Common Voice compatible format with metadata.",
    },
    validated: {
      name: "Validated Clips Only",
      description: "Quality-checked recordings suitable for model training.",
    },
    processed: {
      name: "Processed Features",
      description: "Pre-computed features for immediate use in ML pipelines.",
    },
  },
  contribute: {
    title: "Contribute Your Voice",
    description: "Help us grow the dataset by recording your voice. It only takes a few minutes.",
    cta: "Start Recording",
  },
} as const;
