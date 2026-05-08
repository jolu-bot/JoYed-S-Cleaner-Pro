# JoYed'S Cleaner Pro

Application desktop Windows basee sur Electron + React pour nettoyage et optimisation systeme.

## Lancer en local

- npm install
- npm start

## Construire un installateur Windows

- npm run dist

Sortie principale:

- dist/JoYedS Cleaner Setup 1.0.0.exe

## Signature numerique en production

Electron Builder supporte la signature via variables d'environnement.

Exemple PowerShell:

- $env:CSC_LINK="file:C:/certs/joyeds-cleaner.pfx"
- $env:CSC_KEY_PASSWORD="VOTRE_MOT_DE_PASSE"
- npm run dist:signed

Notes:

- La signature demande un certificat de signature de code valide.
- Sans certificat, le build fonctionne mais Windows SmartScreen affichera plus d'alertes.

## Securite integree

- Verification mode administrateur avant actions sensibles.
- Confirmation utilisateur obligatoire sur actions sensibles.
- Creation d'un point de restauration avant execution sensible.
- Sauvegarde operationnelle dans Documents/JoYedsCleanerBackups.

## Logo et icone

- Logo UI: src/assets/joyeds-logo.png
- Icone Windows: build/icons/app.ico
