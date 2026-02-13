# Mon Projet PokemonAPI en TypeScript

Une application pokédex propulsé sur [Bun](https://bun.sh/).

## 🛠 Prérequis

Assurez-vous d'avoir installé **Bun** sur votre machine :

```bash
curl -fsSL [https://bun.sh/install](https://bun.sh/install) | bash
```

# 🚀 Démarrage Rapide

## 1. Installation des dépendances

```Bash
bun install
```

## 2. Lancer le projet

Pour démarrer le serveur ou le script principal en mode développement avec rechargement automatique (hot reload) :

```Bash
bun dev
```

# 🏗️ Structure du Projet

```Plaintext
├── src/
│   └── main.ts    # Point d'entrée de l'application
├── bun.lockb       # Fichier de verrouillage (binaire)
├── package.json    # Scripts et dépendances
└── tsconfig.json   # Configuration TypeScript
```

# ⚙️ Configuration recommandée (package.json)

Pour que les commandes ci-dessus fonctionnent, assurez-vous d'avoir ces scripts dans votre package.json :

```JSON
{
  "scripts": {
    "dev": "bun --watch src/index.ts",
    "test": "bun test",
    "start": "bun src/index.ts"
  }
}
```