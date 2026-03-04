## PokePortal

Initial stuff for the project

## IMPORTANT!

Make sure you cache data locally for users. 

This is PokiAPIs only big rule to prevent spam. So don't forget to do this or we might get banned.

## Running the Project

**Requirements:** Node.js 18+

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

```

Runs entirely in the browser. No API keys needed.

---

## Caching

All PokeAPI responses are stored in module level objects that persist for the session:

- Opening the customize popup for an added Pokemon is **instant**
- Move types in the all moves list load per row and cache immediately
- Navigating between pages doesn't re fetch anything already loaded

---

## Limitations

- Battle logic not yet implemented.
- A of right now only Gen 1 Pokemon are avaliable in the battle simulator, more will be added if I have time.
- I have not done any reactive styling yet
