export const home = {
  hero: {
    title: "Comorian deserves AI that understands us.",
    description:
      "Most AI doesn't speak Shikomori. We're fixing that—starting with voice data, building toward full language understanding and synthesis.",
    primaryCta: "Contribute Your Voice",
    secondaryCta: "How It Works",
    note: "Recording opens soon. Your voice builds the dataset that powers Comorian speech technology.",
    panelTitle: "Four Islands, Four Voices",
    panelLead: "Each island has its own dialect. We're collecting them all to preserve the full richness of Comorian language.",
    dialects: {
      shingazidja: { name: "Shingazidja", region: "Ngazidja", description: "The dialect of Grande Comore, the largest island" },
      shindzuani: { name: "Shindzuani", region: "Ndzuani", description: "Spoken on Anjouan, known for its distinct rhythms" },
      shimwali: { name: "Shimwali", region: "Mwali", description: "The dialect of Mohéli, the smallest of the four islands" },
      shimaore: { name: "Shimaore", region: "Maore", description: "Spoken in Mayotte with unique local variations" },
    },
  },
  progress: {
    eyebrow: "Our Goal",
    title: "Building the foundation for Comorian AI.",
    description:
      "We're creating an open dataset of 100+ hours of speech across all four dialects. Free for researchers, educators, and developers.",
    hoursGoal: "Hours",
    dialects: "Dialects",
    openDataset: "Open Dataset",
  },
  trust: {
    eyebrow: "Privacy and trust",
    manifesto: "Your voice belongs to you. Not to corporations. Not locked behind proprietary walls. Open by design, private by default.",
    description:
      "Your recordings stay private until reviewed. Our code stays open forever. No hidden data collection, no corporate control—just a community building technology for its own language.",
  },
  contributors: {
    eyebrow: "Community",
    title: "Our community",
    description: "Every voice matters. Join the growing constellation of contributors preserving our language.",
    cta: "Join on GitHub",
  },
  roadmap: {
    eyebrow: "Roadmap",
    title: "The roadmap is visible, but this release keeps attention on contribution readiness.",
    description:
      "Future model interaction matters, but Phase 1 stays disciplined: public mission, trust framing, and a clear path into later recorder work.",
    phases: [
      {
        stage: "Now",
        title: "Public foundation and trust",
        body: "Explain the mission, show the first target, and make privacy expectations plain.",
      },
      {
        stage: "Next",
        title: "Contributor entry and prompting",
        body: "Add optional identity, variant choice, and approved prompt delivery for each contribution.",
      },
      {
        stage: "Later",
        title: "Recording, upload, and public progress",
        body: "Unlock private audio submission, reviewed progress counters, and the owner workflow for curation.",
      },
    ],
  },
  features: {
    record: {
      eyebrow: "Preserve",
      title: "Save our heritage",
      description: "Document Shikomori and all dialects for future generations. Our language lives in our voices—let's capture it before it's lost.",
    },
    community: {
      eyebrow: "Own it",
      title: "Community owned",
      description: "A Comorian-led initiative where the community decides how the technology is developed and used. No outside gatekeepers.",
    },
    dataset: {
      eyebrow: "Access",
      title: "Free for education",
      description: "Teachers, students, and researchers can use the data freely. Build learning tools, study linguistics, or create educational apps.",
    },
    ai: {
      eyebrow: "Use it",
      title: "Technology that understands",
      description: "Speech recognition and voice assistants that actually work in Comorian. No more forcing our elders to learn French or English.",
    },
  },
  cta: {
    title: "Ready to preserve our language?",
    description: "Join the community building the future of Comorian speech technology. Open source, open data, open to all.",
    github: "Join on GitHub",
    getStarted: "Get Started",
  },
  contact: {
    eyebrow: "Support path",
    title: "Support starts with conversation, repository visibility, and careful stewardship.",
    description:
      "Formal donations are intentionally out of scope for this release. The public site instead gives supporters a clear picture of the project and a simple path to follow the work.",
    channels: [
      {
        title: "Open-source coordination",
        body: "Use the public repository and future issue tracker as the first home for collaboration, fixes, and contribution questions.",
        action: "Public repository",
        hint: "Publish the repository URL before launch.",
      },
      {
        title: "Sponsor preparation",
        body: "Use this page to explain the current milestone, the privacy stance, and why the speech dataset is being built carefully first.",
        action: "Sponsor brief",
        hint: "Add a direct contact email before sponsor outreach starts.",
      },
    ],
  },
} as const;
