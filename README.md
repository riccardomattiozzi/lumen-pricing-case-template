# LUMEN — Pricing & Go-to-Market Case — Kit de démarrage ATELIA × ESCP

> Ce repo est votre point de départ. Codex doit lire ce README en premier.

## Le brief

Le brief complet est dans **`LUMEN_Case_Brief.md`** (et une version mise en page dans
`LUMEN_Case_Brief.pdf`). Les données sont dans le dossier **`data/`**, documentées dans
`data/README_data.md`.

Résumé en une phrase : LUMEN, une marque de boisson fonctionnelle, doit décider **prix,
positionnement et canal(aux) de lancement** pour entrer sur le marché allemand — sans données de
ventes allemandes réelles (LUMEN n'y est pas encore), avec un arbitrage réel entre le CMO (positionnement
premium) et le CFO (retour sur investissement rapide).

## Règle n°1 — Consignez tous vos prompts dans `PROMPTS.md`

Chaque fois que vous envoyez une instruction à un assistant IA (Codex ou autre) pour écrire, modifier ou corriger du code, ajoutez une entrée dans `PROMPTS.md` **avant** de passer à autre chose. Ne réécrivez pas l'historique après coup.

**Équipe de 4** : indiquez qui a envoyé chaque prompt, pas juste l'horodatage.

Format attendu pour chaque entrée :

```
## Prompt 3 — Sacha — 14h22
Objectif : ajouter un filtre par date sur le tableau de résultats
Prompt envoyé : "..."
Résultat : a marché du premier coup / a nécessité 2 itérations / n'a pas marché, changé d'approche
```

**Pourquoi on vous demande ça** : ce n'est pas pour vous surveiller. C'est ce qui nous permet, à la fin, de comprendre *comment* vous avez raisonné — pas seulement ce que vous avez produit. Un bon résultat obtenu avec un prompt clair dès le départ n'est pas noté comme un bon résultat obtenu après quinze essais au hasard.

## Règle n°2 — Avant de coder, posez-vous ces questions

Cochez chaque case dans ce README au fur et à mesure — pas à la fin, pendant que vous avancez :

- [ ] **Données** : quelles données mon outil va-t-il manipuler ? Sont-elles sensibles (données personnelles, données client de l'entreprise) ? *`data/customer_survey.csv` contient des colonnes nom/email — les avez-vous utilisées dans votre outil ? Si oui, comment les avez-vous protégées/anonymisées ? Si non, pourquoi avez-vous choisi de ne pas les exposer ?* (Une équipe qui n'y touche pas doit quand même pouvoir répondre — "on a choisi de ne pas les utiliser" est une réponse valable.)
- [ ] **Clés d'API** : si votre outil appelle une API externe (météo, ou autre), où est stockée la clé ? Jamais codée en dur dans un fichier commité sur GitHub. (Réponse valable : "on n'a utilisé aucune API externe".)
- [ ] **Déploiement** : si vous avez déployé une démo live, est-ce qu'un endpoint ou une réponse renvoie des données brutes non filtrées (ex. le détail complet du survey avec nom/email) à n'importe quel visiteur ?
- [ ] **Fichiers générés en cours de route** : si votre outil (ou Codex) a créé de nouveaux fichiers dérivés des données fournies, avez-vous réfléchi à s'ils devaient être commités sur le repo ou non ?
- [ ] **Stockage** : si je conserve des données, dans quelle structure et pourquoi ce choix plutôt qu'un autre ?
- [ ] **Robustesse** : que se passe-t-il si l'utilisateur donne une entrée vide, incohérente ou inattendue ?
- [ ] **Explicabilité** : est-ce que je peux expliquer à quelqu'un du métier — pas technique — pourquoi mon outil fait ce qu'il fait ?
- [ ] **Pertinence business** : est-ce que mon prototype répond vraiment au problème posé dans le brief, ou est-ce une version technique intéressante mais à côté du sujet ?

Ces questions ne sont pas là pour vous ralentir — elles font partie de ce qui est évalué. Une réponse réfléchie à l'une d'entre elles vaut plus qu'une fonctionnalité supplémentaire non demandée.

## Ce qu'on attend à la fin

1. Un prototype qui fonctionne, même partiellement, sur le cas LUMEN
2. `PROMPTS.md` rempli au fil de l'eau, par toute l'équipe
3. Un court paragraphe ci-dessous, écrit en langage business (pas technique), qui explique ce que vous avez fait et pourquoi

### Notre approche

[À remplir par l'équipe en fin de travail.]
