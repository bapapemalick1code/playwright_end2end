import * as fs from 'fs'; //module pour interagir avec le système de fichiers
import * as path from 'path'; //module pour gérer et manipuler les chemins de fichiers

// Définition du chemin du fichier où les informations du user (email et password) seront stockées
const userCredentialsPath = path.join(__dirname, './validUser.json');

export function updateValidUsers(email: string, password: string) {
    // Création d'un objet contenant les données de l'utilisateur
    const userData = { email, password };

    // Écriture des données utilisateur dans le fichier JSON.
    // 'JSON.stringify' convertit l'objet JavaScript en chaîne JSON.
    // Le deuxième argument 'null' et le troisième argument '2' formatent le JSON avec une indentation de 2 espaces pour une meilleure lisibilité.
    // 'utf-8' spécifie le format d'encodage pour l'écriture du fichier.
    fs.writeFileSync(userCredentialsPath, JSON.stringify(userData, null, 2), 'utf-8');
}

export function getValidUsers() {
    // Vérification si le fichier contenant les informations du user existe
    if (fs.existsSync(userCredentialsPath)) {
        // 'fs.readFileSync' lit le contenu du fichier en format texte (encodé en 'utf-8')
        const rawData = fs.readFileSync(userCredentialsPath, 'utf-8');

        // Conversion de la chaîne JSON en objet JavaScript et retour des données utilisateur
        return JSON.parse(rawData);
    }
    
    // Retourne 'null' si le fichier n'existe pas ou si aucune donnée n'est disponible
    return null;
}














/*
//Déclarer les acces d'un user valide
let validUsers = {
    email: 'validuser@example.com',
    password: 'validpassword123'
  };

  
// Exportation des données de test pour les rendre disponibles dans d'autres fichiers
module.exports = { 
    validUsers,
    //Maj du user ayant des acces valides
    updateValidUsers(newEmail: string, newPassword: string) {
        validUsers.email = newEmail;
        validUsers.password = newPassword;
    }};
    */