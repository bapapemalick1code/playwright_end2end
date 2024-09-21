import { Reporter, TestCase, TestResult } from '@playwright/test/reporter';
import axios from 'axios'; //Une bibliothèque pour effectuer des requêtes HTTP, utilisée ici pour interagir avec l'API Xray
import * as fs from 'fs'; //module pour interagir avec le système de fichiers
require('dotenv').config();


class XrayReporter implements Reporter {
    // Utiliser les identifiants API depuis les variables d'environnement
  private xray_baseURL = process.env.XRAY_BASE_URL;
  private xray_client_id = process.env.XRAY_CLIENT_ID;
  private xray_client_secret = process.env.XRAY_CLIENT_SECRET;

  private results: any[] = []; //Stocke les résultats des tests au fur et à mesure de leur exécution.
  private xrayToken: string | null = null;

  //Cette méthode est appelée au début des tests (onBegin), et elle s'authentifie auprès de l'API Xray en envoyant une requête POST.
  async onBegin() {
    console.log('Authenticating with Xray...');
    // Appeler l'API Xray pour obtenir un Token
    try {
      const response = await axios.post(
        `${this.xray_baseURL}/api/v2/authenticate`, 
        {
        client_id: this.xray_client_id, 
        client_secret: this.xray_client_secret
        }, 
        {
        headers: {
          'Content-Type': 'application/json'
        }
        });
      // Stocker le token récupéré
      this.xrayToken = response.data;
      console.log('Successfully authenticated with Xray.');
    } catch (error) {
      console.error('Failed to authenticate with Xray:', error);
    }
  }


  //OnTestEnd() est appelée à la fin de chaque test.
  //Si l'ID est valide, les détails du test (ID, statut, durée, erreurs, captures d'écran) sont ajoutées à results[].
  onTestEnd(test: TestCase, result: TestResult) {
    const testId = this.extractXrayTestId(test.title);
    if (testId) {
        // Ajout de la capture d'écran à l'objet result si le test echoue
        //recherche une pièce jointe qui a pour nom 'screenshot' et un type de fichier 'image/png' dans un tableau qui contient toutes les pièces jointes (ou attachments) associées au test
    const screenshotAttachment = result.attachments.find(att => att.name === 'screenshot' && att.contentType === 'image/png');
    const screenshotPath = screenshotAttachment ? screenshotAttachment.path : null; //Si une capture d'écran PNG est trouvée, il récupère son chemin sinon la variable screenshotPath sera définie à null.

    this.results.push({
        testId,
        status: result.status,
        duration: result.duration,
        error: result.error,
        screenshotPath // Ajoute le chemin de la capture d'écran si elle existe
      });
    }
  }


//OnEnd() est appelée après que tous les tests ont été exécutés.
//Si le token est valide, elle construit un payload avec les résultats des tests et envoie ces résultats à Xray.
  async onEnd(result) {
    console.log('Tests finished. Uploading results to Xray...');

    if (!this.xrayToken) {
      console.error('No Xray token available, skipping upload.');
      return;
    }
    // Construire le payload Xray
    const xrayPayload = this.buildXrayPayload();
    // Envoyer les résultats à Xray
    await this.sendResultsToXray(xrayPayload);
  }


  //Cette méthode Cherche dans le titre des tests un ID Jira (exemple : @KAN-123) pour extraire l'ID lié à Xray.
  extractXrayTestId(testTitle: string): string | null {
    //const match = testTitle.match(/@XRAY-(\d+)/);
    const match = testTitle.match(/@KAN-(\d+)/);
    return match ? match[1] : null;
  }

 
//buildXrayPayload() Construit le payload JSON requis pour envoyer les résultats à Xray.
//Les tests sont transformés en objets Xray avec un ID (testKey), un statut, et un commentaire si une erreur est survenue.
  buildXrayPayload() {
    const currentDateTime = new Date().toISOString(); // Pour les dates actuelles
    const testCases = this.results.map((result) => {
      const evidence = result.status === 'failed' ? [this.addEvidenceToFailedTest(result)] : []; //Affecte à la variable evidence Un tableau contenant la capture d'écran si le test a échoué sinon un tableau vide.    NB:l'API Xray attend un tableau d'éléments en tant que preuve.
  
      return {
        testKey: `KAN-${result.testId}`,
        start: currentDateTime,
        finish: currentDateTime,
        status: this.mapPlaywrightStatusToXray(result.status),
        comment: result.error ? result.error.message.replace(/\u001b\[.*?m/g, "").replace(/\n/g, "") : undefined, //A formater pour plus de lisibiliter
        evidence: evidence.length ? evidence : undefined //N'inclut pas d'evidence si elle est vide
      };
    });
  
    return {
      info: {
        summary: 'Playwright Test Execution',
        description: 'Test results from Playwright'
      },
      tests: testCases
    };
  }


   //Cette méthode convertit les statuts Playwright (passed, failed, etc.) en statuts Xray (PASSED, FAILED, etc.).
   mapPlaywrightStatusToXray(status: string) {
    switch (status) {
      case 'passed':
        return 'PASSED';
      case 'failed':
        return 'FAILED';
      case 'skipped':
        return 'SKIPPED';
      default:
        return 'TODO';
    }
  }

  // Fonction pour convertir une image en base64
convertImageToBase64(imagePath: string) {
    const image = fs.readFileSync(imagePath);
    return image.toString('base64');
  }
  

  // Fonction pour ajouter des preuves sous forme de capture d'écran
  //Si une capture d'écran existe pour un test échoué, elle est convertie en Base64 pour être envoyée à Xray.
  addEvidenceToFailedTest(result) {
    const screenshotPath = result.screenshotPath; // Utilise le chemin récupéré
    // Vérifie si le fichier existe avant de le lire
    if (!screenshotPath || !fs.existsSync(screenshotPath)) {
        console.warn(`Screenshot not found for test ${result.testId}: ${screenshotPath}`);
        return null; // Retourne null si le fichier n'existe pas
    }

    const base64Screenshot = this.convertImageToBase64(screenshotPath);
    return {
        data: base64Screenshot,
        filename: `${result.testId}.png`,  // Nom du fichier basé sur l'ID du test
        contentType: 'image/png'
    };
  }



  //Cette méthode Envoie les résultats à Xray via une requête POST à l'API /import/execution.
  async sendResultsToXray(payload: any) {
    try {
      const response = await axios.post(
        `${this.xray_baseURL}/api/v2/import/execution`,
        payload, 
        {
        headers: {
          'Authorization': `Bearer ${this.xrayToken}`, // Utiliser le token authentifié
          'Content-Type': 'application/json'
        }
        }
        );
      console.log('Results successfully uploaded to Xray: ', response.data);
  
    } catch (error) {
      console.error('Failed to upload results to Xray: ', error.response.data);
    }
  }


}

export default XrayReporter;





