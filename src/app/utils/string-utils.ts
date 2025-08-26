export function normalizeString(str: string): string {
  return str
    .normalize('NFD') // Décompose les caractères accentués
    .replace(/\p{Diacritic}/gu, '') // Supprime les diacritiques
    .toLowerCase(); // Convertit en minuscules
}
