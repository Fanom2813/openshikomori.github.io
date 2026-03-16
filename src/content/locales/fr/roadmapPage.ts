export const roadmapPage = {
  eyebrow: "Feuille de Route",
  title: "Notre Parcours",
  seoTitle: "Feuille de Route",
  seoDescription: "Consultez nos progres et plans futurs pour construire des modeles d'IA pour la langue Shikomori.",
  subtitle: "Suivez notre progression de la fondation au deploiement. Voyez ce qui est termine, en cours, et a venir.",
  legend: {
    completed: "Termine",
    inProgress: "En Cours",
    upcoming: "A Venir",
  },
  phases: {
    foundation: {
      stage: "Phase 1 : Fondation",
      period: "T4 2024 - T1 2025",
      items: {
        website: {
          title: "Lancement du Site Public",
          description: "Site multi-page avec mission, roadmap et parcours de contribution.",
        },
        documentation: {
          title: "Documentation \u0026 Directives",
          description: "Guides contributeurs, politiques de confidentialite et procedures de gestion des donnees.",
        },
        community: {
          title: "Construction Communautaire",
          description: "Organisation GitHub, suivi des tickets et onboarding des contributeurs.",
        },
      },
    },
    dataCollection: {
      stage: "Phase 2 : Collecte de Donnees",
      period: "T2 2025 - T3 2025",
      items: {
        recording: {
          title: "Plateforme d'Enregistrement",
          description: "Enregistreur web avec selection de variante et livraison de phrases.",
        },
        validation: {
          title: "Revue \u0026 Validation",
          description: "Workflow de controle qualite pour les enregistrements soumis.",
        },
        dataset: {
          title: "Curation du Dataset",
          description: "Organiser, nettoyer et publier des datasets structures.",
        },
      },
    },
    modelTraining: {
      stage: "Phase 3 : Entrainement du Modele",
      period: "T4 2025 - T1 2026",
      items: {
        baseline: {
          title: "Modele ASR de Base",
          description: "Entrainer le premier modele de reconnaissance vocale comorien.",
        },
        finetuning: {
          title: "Affinage \u0026 Optimisation",
          description: "Ameliorer la precision et etendre a toutes les variantes comoriennes.",
        },
        evaluation: {
          title: "Framework d'Evaluation",
          description: "Outils de benchmarking et tests de performance.",
        },
      },
    },
    deployment: {
      stage: "Phase 4 : Deploiement",
      period: "T2 2026+",
      items: {
        api: {
          title: "API Publique",
          description: "API speech-to-text pour developpeurs et applications.",
        },
        opensource: {
          title: "Publication du Modele",
          description: "Poids du modele open source et code d'entrainement.",
        },
        applications: {
          title: "Applications Exemples",
          description: "Apps de demonstration pour transcription et interfaces vocales.",
        },
      },
    },
  },
  cta: {
    title: "Vous voulez contribuer ?",
    description: "Rejoignez-nous sur GitHub pour suivre la progression et participer au developpement.",
    button: "Voir sur GitHub",
  },
} as const;
