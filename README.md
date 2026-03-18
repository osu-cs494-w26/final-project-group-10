# PokePortal

This is a fullstack Pokémon web app built with React and Vite. You can browse the complete Pokédex, battle AI trainers, and test your Pokémon knowledge with daily challenges.

## Features

**Pokédex** Interactive list of Pokémon up to 6th generation with following features:

Filters - allows you to filter list based on name, type, lowest-highest, highest-lowest, A-Z, Z-A

Cry Sound Button - hear the sound of selected Pokémon

Stats Bar - allows you to visualize base stats of Pokémon (including HP, Attack, Defense, etc)

Abilites List - see detailed descriptions for Pokémon abilities, including hidden ones

Height Comparison - enter your height to see how big (or small) Pokémon are compared to you


**Battle System** Turnbased battles using the official Gen 5 damage formula. Supports three modes:

Quick Battle gives you and your AI opponent a random Pokemon team with random moves.

Build Team lets you construct a custom team with full EV allocation, move customisation, items, and ability selection, then save it to one of ten slots.

Battle Trainer lets you challenge 12 trainers from across the games, each with curated teams and EV spreads, using one of your saved teams.

**Who's That Pokémon?** 

**Personality Quiz** 

## Tech Stack

**Frontend** React 18 with Vite

**Auth and Database** Supabase. Saved teams persist per authenticated user.

**Data** PokéAPI provides all Pokémon, move, and ability data.

## Running the Project

Requirements: Node.js 18+

```bash
npm install
npm run dev
```

Create a `.env` file in the project root with the Supabase credentials:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Project Structure

```
src/
  components/     Shared UI components
  hooks/          useBattle, usePokemonData, useAuth
  moves/          Move effect registry split by type (18 files)
  pages/          Top level page components
  styles/         Global CSS variables and base styles
  utils/          Battle engine, constants, move effects registry, Supabase client
```

## Caching

All PokéAPI responses are cached at the module level and persist for the session. Once a Pokémon or move is fetched it is never rerequested. If you hav any aditions to the project please make sure you cach your changes locally.
