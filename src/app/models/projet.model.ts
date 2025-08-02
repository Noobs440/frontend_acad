// src/app/models/projet.model.ts
// src/app/models/projet.model.ts
export interface Projet {
  id: number;
  titre_projet: string;
  descript_projet?: string;
  etudiant?: { name: string };
  niveau?: { name: string };
  categorie?: { name: string };
  statut: string;
  image_path?: string;
  // ajoute tous les champs dont tu as besoin…
}
