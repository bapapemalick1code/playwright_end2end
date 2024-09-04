import { faker } from '@faker-js/faker';

// Générer une date aléatoire
const randomDate = faker.date.past(); // ou faker.date.future(), faker.date.between(startDate, endDate)


// Exportation des données de test pour les rendre disponibles dans d'autres fichiers
module.exports = {
    // Données pour un utilisateur 
    dataUser: {
      fullname: faker.person.fullName(),               
      email: faker.internet.email(),   
      password: faker.internet.password(),   
      day: String(randomDate.getDate()), // Jour du mois (1-31)
      month: String(randomDate.getMonth() + 1),// Mois (0-11, +1 pour avoir 1-12)
      year: String(randomDate.getFullYear()), // Année
      first_name: faker.person.firstName(),
      last_name: faker.person.lastName(),
      company: faker.company.name(),
      address1: faker.location.streetAddress(),
      address2: faker.location.streetAddress(),
      country: faker.location.country(),
      state: faker.location.state(),
      city: faker.location.city(),
      zip_code: faker.location.zipCode(),
      mobile_number: faker.phone.number()
    },
    
  };


    