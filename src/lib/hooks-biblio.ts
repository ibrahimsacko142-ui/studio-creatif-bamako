// Bibliothèque de hooks prêts à l'emploi — classés par émotion/technique
// Pas d'IA : données curatées mises à jour manuellement.
// Adapter au contexte malien / ouest-africain.

export interface Hook {
  texte: string;
  technique: string;
  exemple_sujet?: string;
}

export interface HookCategory {
  id: string;
  label: string;
  emoji: string;
  description: string;
  couleur: string;
  hooks: Hook[];
}

export const HOOKS_BIBLIOTHEQUE: HookCategory[] = [
  {
    id: 'curiosite',
    label: 'Curiosité',
    emoji: '🤔',
    description: 'Suscite le besoin de savoir. L\'utilisateur DOIT continuer pour découvrir la réponse.',
    couleur: 'border-purple-200 bg-purple-50',
    hooks: [
      { texte: 'Ce que personne ne te dit sur [sujet] à Bamako…', technique: 'Curiosité + secret', exemple_sujet: 'la scène rap, le business local' },
      { texte: 'J\'ai testé [sujet] pendant 30 jours. Voici ce que personne n\'avait prédit…', technique: 'Curiosité + suspense', exemple_sujet: 'poster tous les jours, freestyle quotidien' },
      { texte: 'Quand j\'ai compris ça sur [sujet], tout a changé…', technique: 'Révélation promise', exemple_sujet: 'l\'industrie musicale, le design' },
      { texte: '3 choses que les créateurs maliens font mal (et comment les corriger)', technique: 'Curiosité + valeur promise' },
      { texte: 'Pourquoi [personne/sujet] va te surprendre cette semaine…', technique: 'Teaser + anticipation' },
      { texte: 'Arrête de faire [erreur courante]. Voici ce que font les pros…', technique: 'Curiosité + correction' },
      { texte: 'Ce son est sorti il y a 24h. Voici pourquoi tout Bamako en parle…', technique: 'Urgence + FOMO' },
    ],
  },
  {
    id: 'choc',
    label: 'Choc',
    emoji: '😱',
    description: 'Casse le pattern de scroll. Surprend, dérange ou frappe fort dès la première seconde.',
    couleur: 'border-red-200 bg-red-50',
    hooks: [
      { texte: 'J\'ai perdu 200K FCFA en 1 semaine. Voici ce que j\'ai appris…', technique: 'Perte + leçon' },
      { texte: 'Personne n\'ose le dire, mais [vérité dérangeante]…', technique: 'Téméraire + polémique soft' },
      { texte: 'Si tu fais ça, tu vas tuer ta carrière en 2026.', technique: 'Avertissement direct' },
      { texte: 'J\'ai failli abandonner la musique. La raison va te surprendre…', technique: 'Vulnérabilité + choc' },
      { texte: '7 créateurs maliens ont échoué avec cette stratégie. Voici pourquoi…', technique: 'Preuve sociale inversée' },
      { texte: 'On m\'a dit que je n\'y arriverais jamais. Aujourd\'hui, [résultat]…', technique: 'Revers + revanche' },
      { texte: 'Ce n\'est PAS ce que tu crois sur [sujet]…', technique: 'Casser les croyances' },
    ],
  },
  {
    id: 'reussite',
    label: 'Réussite',
    emoji: '🏆',
    description: 'Montre un résultat concret. Inspire et promet une méthode reproductible.',
    couleur: 'border-green-200 bg-green-50',
    hooks: [
      { texte: 'En 3 mois, mon single a fait 50K écoutes. Voici mon plan exact…', technique: 'Chiffre + méthode promise' },
      { texte: 'Comment je suis passé de 0 à 10K abonnés en postant [format]…', technique: 'Avant/après + transparence' },
      { texte: 'Ce post m\'a rapporté 5 clients en 48h. Décryptage…', technique: 'Résultat business + analyse' },
      { texte: '5 habitudes que j\'ai prises cette année (et qui ont tout changé)…', technique: 'Liste + transformation' },
      { texte: 'Comment [personne connue locale] a percé — et ce que tu peux copier…', technique: 'Modèle + applicable' },
      { texte: 'Mon erreur #1 a été de croire que [croyance limitante]. Voici la vérité…', technique: 'Confession + leçon' },
      { texte: 'J\'ai posté 1 vidéo par jour pendant 90 jours. Voici le résultat brut…', technique: 'Challenge documenté' },
    ],
  },
  {
    id: 'emotion',
    label: 'Émotion',
    emoji: '❤️',
    description: 'Touche le cœur. Histoires personnelles, vulnérabilité, fierté, nostalgie.',
    couleur: 'border-rose-200 bg-rose-50',
    hooks: [
      { texte: 'Cette nuit à Markala, j\'ai compris pourquoi je fais de la musique…', technique: 'Lieu + révélation intime' },
      { texte: 'Mon père m\'a dit: "Si tu rates Bamako, tu rates tout." Voici ce que ça veut dire…', technique: 'Citation familiale + sagesse' },
      { texte: 'Quand ma mère a entendu ce son pour la première fois, elle a pleuré…', technique: 'Émotion + scène visuelle' },
      { texte: 'Il y a 5 ans, je dormais sur un canapé à [quartier]. Aujourd\'hui…', technique: 'Humilité + contraste' },
      { texte: 'Cette chanson n\'est pas pour tout le monde. Elle est pour [cible]…', technique: 'Exclusivité émotionnelle' },
      { texte: 'Ce que le fleuve Niger m\'a appris sur la patience…', technique: 'Métaphore locale + leçon' },
      { texte: 'On dit que Bamako ne dort jamais. Moi je sais pourquoi…', technique: 'Stéréoke + révélation' },
    ],
  },
  {
    id: 'polemique',
    label: 'Polémique',
    emoji: '⚡',
    description: 'Prend position. Provoque les commentaires et le débat. À utiliser avec mesure.',
    couleur: 'border-amber-200 bg-amber-50',
    hooks: [
      { texte: 'Arrêtez de dire que le rap malien n\'est pas viable. Voici pourquoi…', technique: 'Contre-croyance + argumentation' },
      { texte: 'Les vrais créateurs ne postent pas tous les jours. Et voici pourquoi…', technique: 'Contre-tendance' },
      { texte: 'Si tu n\'as pas [critère], tu n\'es pas un vrai [métier] à Bamako…', technique: 'Provocation ciblée' },
      { texte: 'Le problème avec [sujet], c\'est que tout le monde ment…', technique: 'Révélation + accusation' },
      { texte: 'Je vais m\'en faire des ennemis, mais il faut le dire: [vérité]…', technique: 'Courage + transparence' },
      { texte: 'Tel artiste a raison sur [sujet]. Et voici pourquoi ça dérange…', technique: 'Soutien controversé' },
      { texte: 'Les [catégorie] qui réussissent à Bamako ont UN truc en commun. Ce n\'est pas ce que tu crois…', technique: 'Généralisation + twist' },
    ],
  },
  {
    id: 'chiffres',
    label: 'Chiffres',
    emoji: '🔢',
    description: 'Quantifie. Les chiffres retiennent l\'œil et promettent du contenu structuré.',
    couleur: 'border-blue-200 bg-blue-50',
    hooks: [
      { texte: '3 erreurs qui tuent 90% des créateurs à Bamako…', technique: 'Chiffres + peur' },
      { texte: '5 plugins gratuits que tout designer malien devrait connaître…', technique: 'Liste + valeur gratuite' },
      { texte: 'En 24h, j\'ai eu 1K partages avec cette stratégie. Décryptage en 4 étapes…', technique: 'Résultat chiffré + structure' },
      { texte: '72 heures pour préparer une sortie qui marche. Voici le plan…', technique: 'Contrainte temps + plan' },
      { texte: '7 outils pour faire du contenu pro avec 0 FCFA…', technique: 'Liste + accessibilité' },
      { texte: '2 phrases qui m\'ont fait gagner 50K vues. Voici lesquelles…', technique: 'Promesse spécifique' },
      { texte: '10% des créateurs font 90% des vues. Voici leur secret…', technique: 'Stat frappante + promesse' },
    ],
  },
  {
    id: 'identite',
    label: 'Identité locale',
    emoji: '🌍',
    description: 'Fait appel à la fierté malienne, bamakoise, ouest-africaine. Résonne avec la communauté.',
    couleur: 'border-orange-200 bg-orange-50',
    hooks: [
      { texte: 'Si tu es né à Bamako, ce son est pour toi…', technique: 'Appartenance directe' },
      { texte: 'Seuls ceux qui ont grandi à [quartier] comprendront ça…', technique: 'Hyper-ciblage géo' },
      { texte: 'Ce que la jeunesse malienne a compris avant tout le monde…', technique: 'Fierté collective' },
      { texte: 'On dit que le Mali est la cruche de l\'Afrique de l\'Ouest. Voici pourquoi c\'est vrai…', technique: 'Proverbe + revendication' },
      { texte: 'Bamako, Ségou, Markala — chaque ville a sa vibration. Voici la mienne…', technique: 'Énumération + intimité' },
      { texte: 'Quand un Malien dit "Inch\'Allah", ce n\'est pas une excuse. C\'est…', technique: 'Code culturel + révélation' },
      { texte: 'Le 223, c\'est plus qu\'un indicatif. C\'est une famille. Voici pourquoi…', technique: 'Symbole + émotion' },
    ],
  },
  {
    id: 'question',
    label: 'Question directe',
    emoji: '❓',
    description: 'Engage directement l\'audience. Force une réponse mentale ou en commentaire.',
    couleur: 'border-teal-200 bg-teal-50',
    hooks: [
      { texte: 'Quelle est TA première mémoire de [sujet] à Bamako ?', technique: 'Question nostalgique' },
      { texte: 'Si tu devais choisir un seul son pour l\'été 2026, ce serait lequel ?', technique: 'Question choix' },
      { texte: 'Tu préfères [option A] ou [option B] ? Pourquoi ?', technique: 'Dilemme' },
      { texte: 'Combien de créateurs maliens peux-tu nommer en 10 secondes ?', technique: 'Challenge mental' },
      { texte: 'Quel est le meilleur single sorti cette année à Bamako ? (+ mon top 3)', technique: 'Question + valeur' },
      { texte: 'Si tu devais conseiller UN conseil à un jeune créateur, ce serait quoi ?', technique: 'Question sagesse' },
      { texte: 'Quel âge avait ton premier idole quand tu as su que tu voulais faire comme lui ?', technique: 'Question intime' },
    ],
  },
  {
    id: 'contraste',
    label: 'Contraste',
    emoji: '⚖️',
    description: 'Oppose deux réalités. Crée une tension narrative immédiate.',
    couleur: 'border-indigo-200 bg-indigo-50',
    hooks: [
      { texte: 'Tellement de talent, si peu de vues. Voici pourquoi…', technique: 'Injustice + analyse' },
      { texte: 'Avant: 0 FCFA. Après: [résultat]. Ce qui a changé en 1 an…', technique: 'Avant/après chiffré' },
      { texte: 'Les pros font ça en 5 min. Les débutants y passent 5h. Voici la différence…', technique: 'Pro vs débutant' },
      { texte: 'Hier je pensais que [croyance]. Aujourd\'hui je sais que [inverse]…', technique: 'Évolution pensée' },
      { texte: 'À Bamako, [chose A]. À Abidjan, [chose B]. Voici ce que ça nous apprend…', technique: 'Comparaison géo' },
      { texte: 'L\'échec te fait peur ? Regarde ce que [personne] a fait APRÈS avoir raté…', technique: 'Échec vs rebond' },
      { texte: 'On parle de [sujet A], mais on oublie [sujet B]. C\'est une erreur…', technique: 'Angle oublié' },
    ],
  },
];
