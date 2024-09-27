import { Reporter, TestCase, TestResult, TestStep } from '@playwright/test/reporter';
import axios from 'axios';
import * as fs from 'fs';
require('dotenv').config();

class XrayReporterWithSteps implements Reporter {
  private xray_baseURL = process.env.XRAY_BASE_URL;
  private xray_client_id = process.env.XRAY_CLIENT_ID;
  private xray_client_secret = process.env.XRAY_CLIENT_SECRET;
  private xrayToken: string | null = null;
  private results: any[] = [];  // Stocker les résultats des tests

  // Authentification
  async onBegin() {
    console.log('Authenticating with Xray...');
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
        }
      );
      this.xrayToken = response.data;
      console.log('Successfully authenticated with Xray.');
    } catch (error) {
      console.error('Failed to authenticate with Xray:', error);
    }
  }

  // Stocke les informations des tests
  async onTestEnd(test: TestCase, result: TestResult) {
    const steps = result.steps.map((step: TestStep) => ({
      action: step.title,
      data: '',
      result: step.error ? 'The step failed.' : 'The step passed.'
    }));

    const screenshots = result.attachments && result.attachments.length > 0 ? result.attachments.filter(att => att.contentType === 'image/png') : [];
    // Stocke les informations du test à créer plus tard dans Xray
    this.results.push({
      title: test.title,
      steps: steps,
      status: result.status,
      error: result.error,
      Screenshots: screenshots,
      created: false  // Indiquer que le cas de test n'a pas encore été créé (pour gerer le contrainte de retry qui créé 2fois le mm cas de test en l'executant depuis le CI)
    });
  }

  // Récupère l'ID Jira lié à Xray à partir du titre du test
  extractXrayTestId(testTitle: string): string | null {
    const match = testTitle.match(/@KAN-(\d+)/);  // Ajustez selon le structure du titre
    return match ? match[1] : null;
  }

  // Crée tous les cas de tests et l'exécution après la fin des tests
  async onEnd() {
    if (!this.xrayToken) {
      console.error('No Xray token available, skipping upload.');
      return;
    }

    if (this.results.length === 0) {
      console.log('No test results available to create.');
      return;
    }

    console.log('Creating test cases in Xray after all tests have run...');
    
    // Créez les cas de tests en une fois avec toutes les informations collectées
    const testCaseKeys: string[] = [];

    for (const result of this.results) {
      if (!result.created) {  // Ne créez un cas de test que si cela n'a pas encore été fait
      const testCaseKey = await this.createTestCaseWithSteps(result.title, result.steps);
      
        if (testCaseKey) {
          testCaseKeys.push(testCaseKey);  // Stocke la clé du test créé (ex: KAN-97)
          result.created = true;  // Marquez comme créé
        }
      }
    }

    if (testCaseKeys.length > 0) {
      console.log('Test cases created with keys:', testCaseKeys);

      // Créez l'exécution de test après avoir créé les cas de tests
      await this.createTestExecution(testCaseKeys);
    } else {
      console.log('No test cases were created.');
    }
  }


  // Crée un cas de test avec les étapes dans Xray
  async createTestCaseWithSteps(testTitle: string, steps: any[]) {
    const payload = [
      {
        testtype: "Manual",
        fields: {
          summary: testTitle,
          project: { key: "KAN" }  // Remplacez par le code de votre projet
        },
        steps: steps
      }
    ];
//Créer un process de retrying pour gerer les timeout selon la creation des differents cas de test
    let attempts = 0;
    const maxAttempts = 3; //le nombre de tentatives
    const waitTime = 3000; //le nombre de délai entre chaque tentative à 3 secondes

    while (attempts < maxAttempts) {
      try {
        const response = await axios.post(
          `${this.xray_baseURL}/api/v1/import/test/bulk`,//requete pour crée un cas de test fourni par XRAY
          payload,
          {
            headers: {
              Authorization: `Bearer ${this.xrayToken}`,
              "Content-Type": "application/json"
            }
          }
        );
        
        const jobId = response.data.jobId;
        console.log(`Test case creation response: Job ID ${jobId}`);
        
        const testCaseKeys = await this.checkJobStatus(jobId);
        console.log(`Test case keys after job completion: ${testCaseKeys}`);
        return testCaseKeys;
      } catch (error) {
        if (error.response && error.response.data.error.includes("A job to import tests is already in progress")) {
          console.warn("Import job in progress, retrying...");
          attempts++;
          await new Promise(resolve => setTimeout(resolve, waitTime));
        } else {
          console.error("Failed to create test case:", error.response ? error.response.data : error.message);
          break;
        }
      }
    }
    return null;
  }


  // Vérifie le statut du job pour récupérer les clés des cas de tests créés
  async checkJobStatus(jobId: string) {
    const maxAttempts = 10;  // Augmentez le nombre de tentatives
    const waitTime = 10000;  // Augmentez le délai entre chaque tentative à 10 secondes
    let attempts = 0;
  
    while (attempts < maxAttempts) {
      try {
        const response = await axios.get(
          `${this.xray_baseURL}/api/v1/import/test/bulk/${jobId}/status`, //requete de check status job par XRAY
          {
            headers: {
              Authorization: `Bearer ${this.xrayToken}`
            }
          }
        );
        
        if (response.data.status === 'successful') {
          const testCaseKeys = response.data.result.issues.map((issue: any) => issue.key);
          return testCaseKeys;  // Retourne les clés des cas de test créés (ex: KAN-97)
        } else {
          console.log(`Job status is still pending: ${response.data.status}. Retrying in ${waitTime / 1000} seconds...`);
          attempts++;
          await new Promise(resolve => setTimeout(resolve, waitTime));  // Attendez avant de réessayer
        }
      } catch (error) {
        console.error('Failed to check job status:', error.response ? error.response.data : error.message);
        break;
      }
    }
    
    console.warn('Job did not complete successfully after maximum attempts.');
    return null;
  }
  

  // Crée une exécution de test et y associe les cas de tests créés
async createTestExecution(testCaseKeys: string[]) {
  const executionPayload = this.buildXrayPayload(testCaseKeys);
  //console.log('Payload for test execution:', JSON.stringify(executionPayload, null, 2)); // logger le payload
  try {
    const response = await axios.post(
      `${this.xray_baseURL}/api/v2/import/execution`,
      executionPayload,
      {
        headers: {
          Authorization: `Bearer ${this.xrayToken}`,
          "Content-Type": "application/json"
        }
      }
    );
    console.log('Test execution created successfully:', response.data);
  } catch (error) {
    console.error('Failed to create test execution:', error.response.data);
  }
}


  // Construit le payload pour l'exécution de test
  buildXrayPayload(testCaseKeys: string[]) {
    const currentDateTime = new Date().toISOString();
    const testCases = this.results.map((result, index) => {
       const testCaseKey = testCaseKeys[index][0]; // Recupérer les clés des cas de test (ex: KAN-97): on utilise [index][0] vu que c'est un tableau imbriqué
    // Ajoute les preuves (captures d'écran) avec l'ID du test Jira (ex: KAN-97)
       const evidence = Array.isArray(result.Screenshots) ? result.Screenshots.map((screenshot) => this.addEvidenceToFailedTest(screenshot, testCaseKey)) : []; // Passe l'ID du test ici

        return {
          testKey: testCaseKey,  
          start: currentDateTime,
          finish: currentDateTime,
          status: this.mapPlaywrightStatusToXray(result.status),
          comment: result.error ? result.error.message.replace(/\u001b\[.*?m/g, "").replace(/\n/g, "") : undefined,
          evidence: evidence.length ? evidence : undefined // N'inclut les preuves que si elles existent
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

  // Ajoute une preuve à un test échoué
  addEvidenceToFailedTest(result: any, testId: string) {
    const screenshotPath = result.path; // Utilise le chemin récupéré de l'objet screenshot
    // Vérifier si le chemin du fichier existe avant de le lire
    if (!screenshotPath || !fs.existsSync(screenshotPath)) {
      console.warn(`Screenshot not found for test ${testId}: ${screenshotPath}`);
      return null; // Retourne null si le fichier n'existe pas
    }
    // Convertit l'image en base64
    const base64Screenshot = this.convertImageToBase64(screenshotPath);
    
    return {
      data: base64Screenshot,
      filename: `${testId}.png`,  // Nom du fichier basé sur l'ID du test
      contentType: 'image/png'
    };
  }
  

  // Fonction pour convertir une image en base64
convertImageToBase64(imagePath: string) {
  try {
    const image = fs.readFileSync(imagePath);
    return image.toString('base64');
  } catch (error) {
    console.error(`Error reading screenshot file at ${imagePath}:`, error.message);
    return null;
  }
}


  // Fonction pour mapper le statut Playwright à Xray
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
}

export default XrayReporterWithSteps;









/*
import { Reporter, TestCase, TestResult, TestStep } from '@playwright/test/reporter';
import axios from 'axios';
import * as fs from 'fs';
require('dotenv').config();

class XrayReporterWithSteps implements Reporter {
  private xray_baseURL = process.env.XRAY_BASE_URL;
  private xray_client_id = process.env.XRAY_CLIENT_ID;
  private xray_client_secret = process.env.XRAY_CLIENT_SECRET;
  private xrayToken: string | null = null;
  private results: any[] = [];  // Stocker les résultats des tests

  // Authentification
  async onBegin() {
    console.log('Authenticating with Xray...');
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
        }
      );
      this.xrayToken = response.data;
      console.log('Successfully authenticated with Xray.');
    } catch (error) {
      console.error('Failed to authenticate with Xray:', error);
    }
  }

  // Stocke les informations des tests
  async onTestEnd(test: TestCase, result: TestResult) {
    const steps = result.steps.map((step: TestStep) => ({
      action: step.title,
      data: '',
      result: step.error ? 'The step failed.' : 'The step passed.'
    }));

    const screenshots = result.attachments && result.attachments.length > 0 ? result.attachments.filter(att => att.contentType === 'image/png') : [];
    // Stocke les informations du test à créer plus tard dans Xray
    this.results.push({
      title: test.title,
      steps: steps,
      status: result.status,
      error: result.error,
      Screenshots: screenshots
    });
  }

  // Récupère l'ID Jira lié à Xray à partir du titre du test
  extractXrayTestId(testTitle: string): string | null {
    const match = testTitle.match(/@KAN-(\d+)/);  // Ajustez selon le structure du titre
    return match ? match[1] : null;
  }

  // Crée tous les cas de tests et l'exécution après la fin des tests
  async onEnd() {
    if (!this.xrayToken) {
      console.error('No Xray token available, skipping upload.');
      return;
    }

    if (this.results.length === 0) {
      console.log('No test results available to create.');
      return;
    }

    console.log('Creating test cases in Xray after all tests have run...');
    
    // Créez les cas de tests en une fois avec toutes les informations collectées
    const testCaseKeys: string[] = [];

    for (const result of this.results) {
      const testCaseKey = await this.createTestCaseWithSteps(result.title, result.steps);
      
      if (testCaseKey) {
        testCaseKeys.push(testCaseKey);  // Stocke la clé du test créé (ex: KAN-97)
      }
    }

    if (testCaseKeys.length > 0) {
      console.log('Test cases created with keys:', testCaseKeys);

      // Créez l'exécution de test après avoir créé les cas de tests
      await this.createTestExecution(testCaseKeys);
    } else {
      console.log('No test cases were created.');
    }
  }


  // Crée un cas de test avec les étapes dans Xray
  async createTestCaseWithSteps(testTitle: string, steps: any[]) {
    const payload = [
      {
        testtype: "Manual",
        fields: {
          summary: testTitle,
          project: { key: "KAN" }  // Remplacez par le code de votre projet
        },
        steps: steps
      }
    ];
//Créer un process de retrying pour gerer les timeout selon la creation des differents cas de test
    let attempts = 0;
    const maxAttempts = 3; //le nombre de tentatives
    const waitTime = 3000; //le nombre de délai entre chaque tentative à 3 secondes

    while (attempts < maxAttempts) {
      try {
        const response = await axios.post(
          `${this.xray_baseURL}/api/v1/import/test/bulk`,//requete pour crée un cas de test fourni par XRAY
          payload,
          {
            headers: {
              Authorization: `Bearer ${this.xrayToken}`,
              "Content-Type": "application/json"
            }
          }
        );
        
        const jobId = response.data.jobId;
        console.log(`Test case creation response: Job ID ${jobId}`);
        
        const testCaseKeys = await this.checkJobStatus(jobId);
        console.log(`Test case keys after job completion: ${testCaseKeys}`);
        return testCaseKeys;
      } catch (error) {
        if (error.response && error.response.data.error.includes("A job to import tests is already in progress")) {
          console.warn("Import job in progress, retrying...");
          attempts++;
          await new Promise(resolve => setTimeout(resolve, waitTime));
        } else {
          console.error("Failed to create test case:", error.response ? error.response.data : error.message);
          break;
        }
      }
    }
    return null;
  }


  // Vérifie le statut du job pour récupérer les clés des cas de tests créés
  async checkJobStatus(jobId: string) {
    const maxAttempts = 10;  // Augmentez le nombre de tentatives
    const waitTime = 10000;  // Augmentez le délai entre chaque tentative à 10 secondes
    let attempts = 0;
  
    while (attempts < maxAttempts) {
      try {
        const response = await axios.get(
          `${this.xray_baseURL}/api/v1/import/test/bulk/${jobId}/status`, //requete de check status job par XRAY
          {
            headers: {
              Authorization: `Bearer ${this.xrayToken}`
            }
          }
        );
        
        if (response.data.status === 'successful') {
          const testCaseKeys = response.data.result.issues.map((issue: any) => issue.key);
          return testCaseKeys;  // Retourne les clés des cas de test créés (ex: KAN-97)
        } else {
          console.log(`Job status is still pending: ${response.data.status}. Retrying in ${waitTime / 1000} seconds...`);
          attempts++;
          await new Promise(resolve => setTimeout(resolve, waitTime));  // Attendez avant de réessayer
        }
      } catch (error) {
        console.error('Failed to check job status:', error.response ? error.response.data : error.message);
        break;
      }
    }
    
    console.warn('Job did not complete successfully after maximum attempts.');
    return null;
  }
  

  // Crée une exécution de test et y associe les cas de tests créés
async createTestExecution(testCaseKeys: string[]) {
  const executionPayload = this.buildXrayPayload(testCaseKeys);
  //console.log('Payload for test execution:', JSON.stringify(executionPayload, null, 2)); // logger le payload
  try {
    const response = await axios.post(
      `${this.xray_baseURL}/api/v2/import/execution`,
      executionPayload,
      {
        headers: {
          Authorization: `Bearer ${this.xrayToken}`,
          "Content-Type": "application/json"
        }
      }
    );
    console.log('Test execution created successfully:', response.data);
  } catch (error) {
    console.error('Failed to create test execution:', error.response.data);
  }
}


  // Construit le payload pour l'exécution de test
  buildXrayPayload(testCaseKeys: string[]) {
    const currentDateTime = new Date().toISOString();
    const testCases = this.results.map((result, index) => {
       const testCaseKey = testCaseKeys[index][0]; // Recupérer les clés des cas de test (ex: KAN-97): on utilise [index][0] vu que c'est un tableau imbriqué
    // Ajoute les preuves (captures d'écran) avec l'ID du test Jira (ex: KAN-97)
       const evidence = Array.isArray(result.Screenshots) ? result.Screenshots.map((screenshot) => this.addEvidenceToFailedTest(screenshot, testCaseKey)) : []; // Passe l'ID du test ici

        return {
          testKey: testCaseKey,  
          start: currentDateTime,
          finish: currentDateTime,
          status: this.mapPlaywrightStatusToXray(result.status),
          comment: result.error ? result.error.message.replace(/\u001b\[.*?m/g, "").replace(/\n/g, "") : undefined,
          evidence: evidence.length ? evidence : undefined // N'inclut les preuves que si elles existent
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

  // Ajoute une preuve à un test échoué
  addEvidenceToFailedTest(result: any, testId: string) {
    const screenshotPath = result.path; // Utilise le chemin récupéré de l'objet screenshot
    // Vérifier si le chemin du fichier existe avant de le lire
    if (!screenshotPath || !fs.existsSync(screenshotPath)) {
      console.warn(`Screenshot not found for test ${testId}: ${screenshotPath}`);
      return null; // Retourne null si le fichier n'existe pas
    }
    // Convertit l'image en base64
    const base64Screenshot = this.convertImageToBase64(screenshotPath);
    
    return {
      data: base64Screenshot,
      filename: `${testId}.png`,  // Nom du fichier basé sur l'ID du test
      contentType: 'image/png'
    };
  }
  

  // Fonction pour convertir une image en base64
convertImageToBase64(imagePath: string) {
  try {
    const image = fs.readFileSync(imagePath);
    return image.toString('base64');
  } catch (error) {
    console.error(`Error reading screenshot file at ${imagePath}:`, error.message);
    return null;
  }
}


  // Fonction pour mapper le statut Playwright à Xray
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
}

export default XrayReporterWithSteps;
*/

