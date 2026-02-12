# Publikacja @netri0t/rhfz na npm

## 1. Zaloguj się do npm

W terminalu uruchom (wymaga interakcji – hasło, 2FA itd.):

```bash
npm login
```

Wpisz nazwę użytkownika, hasło i e-mail (lub jednorazowy kod, jeśli masz włączone 2FA).

## 2. Opublikuj pakiet

Pakiet ma zakres (`@netri0t/rhfz`), więc przy pierwszej publikacji podaj `--access public`:

```bash
npm publish --access public
```

Skrypt `prepublishOnly` uruchomi przed publikacją: `npm run typecheck` i `npm run build`.

---

**Aktualna wersja w package.json:** 1.0.4

Jeśli chcesz najpierw zmienić wersję:
- `npm version patch` → np. 1.0.4 → 1.0.5
- `npm version minor` → np. 1.0.4 → 1.1.0
- `npm version major` → np. 1.0.4 → 2.0.0
