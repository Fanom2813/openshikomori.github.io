export const home = {
  hero: {
    title: "Le comorien mérite une IA qui nous comprend.",
    description:
      "La plupart des IA ne parlent pas shikomori. Nous changeons cela—en commençant par les données vocales, pour arriver à la compréhension et la synthèse complète de notre langue.",
    primaryCta: "Contribuer votre voix",
    secondaryCta: "Comment ça marche",
    note: "L'enregistrement ouvre bientôt. Votre voix construit la base de données qui alimentera la technologie vocale comorienne.",
    panelTitle: "Quatre îles, quatre voix",
    panelLead: "Chaque île a son propre dialecte. Nous les collectons tous pour préserver toute la richesse de la langue comorienne.",
    dialects: {
      shingazidja: { name: "Shingazidja", region: "Ngazidja", description: "Le dialecte de Grande Comore, la plus grande île" },
      shindzuani: { name: "Shindzuani", region: "Ndzuani", description: "Parlé à Anjouan, connu pour ses rythmes distincts" },
      shimwali: { name: "Shimwali", region: "Mwali", description: "Le dialecte de Mohéli, la plus petite des quatre îles" },
      shimaore: { name: "Shimaore", region: "Maore", description: "Parlé à Mayotte avec des variations locales uniques" },
    },
  },
  progress: {
    eyebrow: "Notre objectif",
    title: "Construire la fondation pour l'IA comorienne.",
    description:
      "Nous créons une base de données ouverte de 100+ heures de parole couvrant les quatre dialectes. Gratuit pour chercheurs, éducateurs et développeurs.",
    hoursGoal: "Heures",
    dialects: "Dialectes",
    openDataset: "Open Source",
  },
  trust: {
    eyebrow: "Confidentialite et confiance",
    manifesto: "Votre voix vous appartient. Pas aux entreprises. Pas enfermee derriere des murs proprietaires. Ouvert par conception, prive par defaut.",
    description:
      "Vos enregistrements restent prives jusqu'a validation. Notre code reste ouvert pour toujours. Pas de collecte de donnees cachee, pas de controle corporatif—juste une communaute qui construit la technologie pour sa propre langue.",
  },
  contributors: {
    eyebrow: "Communaute",
    title: "Notre communaute",
    description: "Chaque voix compte. Rejoignez la constellation grandissante de contributeurs preservant notre langue.",
    cta: "Rejoindre sur GitHub",
  },
  roadmap: {
    eyebrow: "Feuille de route",
    title: "La feuille de route reste visible, mais cette version garde la priorite sur la preparation des contributions.",
    description:
      "Les futures interactions modele sont importantes, mais la phase 1 reste disciplinee : mission publique, cadre de confiance et passage clair vers le recorder a venir.",
    phases: [
      {
        stage: "Maintenant",
        title: "Fondation publique et confiance",
        body: "Expliquer la mission, montrer l'objectif initial et rendre les attentes de confidentialite tres claires.",
      },
      {
        stage: "Ensuite",
        title: "Entree contributeur et prompts",
        body: "Ajouter l'identite facultative, le choix de variante et la livraison des phrases validees.",
      },
      {
        stage: "Apres",
        title: "Enregistrement, upload et progres public",
        body: "Ouvrir la soumission audio privee, les compteurs revus et le flux proprietaire de curation.",
      },
    ],
  },
  features: {
    record: {
      eyebrow: "Préserver",
      title: "Sauvons notre héritage",
      description: "Documenter le shikomori et tous les dialectes pour les générations futures. Notre langue vit dans nos voix—capturons-la avant qu'elle ne disparaisse.",
    },
    community: {
      eyebrow: "Contrôler",
      title: "Gouvernance communautaire",
      description: "Une initiative comorienne où la communauté décide comment la technologie est développée et utilisée. Pas de garde-fous extérieurs.",
    },
    dataset: {
      eyebrow: "Accéder",
      title: "Gratuit pour l'éducation",
      description: "Enseignants, étudiants et chercheurs peuvent utiliser les données librement. Créez des outils pédagogiques, étudiez la linguistique, développez des applications.",
    },
    ai: {
      eyebrow: "Utiliser",
      title: "Une technologie qui comprend",
      description: "La reconnaissance vocale et les assistants qui fonctionnent vraiment en comorien. Fini d'obliger nos aînés à apprendre le français ou l'anglais.",
    },
  },
  cta: {
    title: "Prêt à préserver notre langue ?",
    description: "Rejoignez la communauté qui construit l'avenir de la technologie vocale comorienne. Open source, données ouvertes, ouvert à tous.",
    github: "Rejoindre sur GitHub",
    getStarted: "Commencer",
  },
  contact: {
    eyebrow: "Chemin de soutien",
    title: "Le soutien commence par la discussion, la visibilite du depot et une gouvernance claire.",
    description:
      "Les dons formels restent hors scope dans cette version. Le site public donne donc surtout une vision claire du projet et un chemin simple pour suivre le travail.",
    channels: [
      {
        title: "Coordination open source",
        body: "Le depot public et son futur espace de tickets doivent devenir le premier point pour collaborer, corriger et poser des questions.",
        action: "Depot public",
        hint: "Publier l'URL du depot avant le lancement.",
      },
      {
        title: "Preparation sponsor",
        body: "Cette page doit deja expliquer le jalon actuel, le cadre de confidentialite et pourquoi le dataset vocal est construit avec prudence.",
        action: "Brief sponsor",
        hint: "Ajouter une adresse email directe avant l'ouverture des demarches sponsor.",
      },
    ],
  },
} as const;
