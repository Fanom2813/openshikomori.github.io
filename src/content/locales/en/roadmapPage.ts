export const roadmapPage = {
  eyebrow: "Roadmap",
  title: "Our Journey",
  seoTitle: "Roadmap",
  seoDescription: "See our progress and future plans for building Shikomori language AI models.",
  subtitle: "Track our progress from foundation to deployment. See what's completed, in progress, and coming next.",
  legend: {
    completed: "Completed",
    inProgress: "In Progress",
    upcoming: "Upcoming",
  },
  phases: {
    foundation: {
      stage: "Phase 1: Foundation",
      period: "Q4 2024 - Q1 2025",
      items: {
        website: {
          title: "Public Website Launch",
          description: "Multi-page site with mission, roadmap, and contribution pathway.",
        },
        documentation: {
          title: "Documentation & Guidelines",
          description: "Contributor guides, privacy policies, and data handling procedures.",
        },
        community: {
          title: "Community Building",
          description: "GitHub organization, issue tracking, and contributor onboarding.",
        },
      },
    },
    dataCollection: {
      stage: "Phase 2: Data Collection",
      period: "Q2 2025 - Q3 2025",
      items: {
        recording: {
          title: "Recording Platform",
          description: "Web-based recorder with variant selection and prompt delivery.",
        },
        validation: {
          title: "Review & Validation",
          description: "Quality control workflow for submitted recordings.",
        },
        dataset: {
          title: "Dataset Curation",
          description: "Organize, clean, and release structured datasets.",
        },
      },
    },
    modelTraining: {
      stage: "Phase 3: Model Training",
      period: "Q4 2025 - Q1 2026",
      items: {
        baseline: {
          title: "Baseline ASR Model",
          description: "Train initial Comorian speech recognition model.",
        },
        finetuning: {
          title: "Fine-tuning & Optimization",
          description: "Improve accuracy and expand to all Comorian variants.",
        },
        evaluation: {
          title: "Evaluation Framework",
          description: "Benchmarking and performance testing tools.",
        },
      },
    },
    deployment: {
      stage: "Phase 4: Deployment",
      period: "Q2 2026+",
      items: {
        api: {
          title: "Public API",
          description: "Speech-to-text API for developers and applications.",
        },
        opensource: {
          title: "Model Release",
          description: "Open-source model weights and training code.",
        },
        applications: {
          title: "Sample Applications",
          description: "Demo apps showcasing transcription and voice interfaces.",
        },
      },
    },
  },
  cta: {
    title: "Want to contribute?",
    description: "Join us on GitHub to follow progress and participate in development.",
    button: "View on GitHub",
  },
} as const;
