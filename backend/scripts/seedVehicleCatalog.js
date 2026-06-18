const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: require('path').join(__dirname, '..', '.env') });

const VehicleCatalog = require('../models/VehicleCatalog.model');

const vehicles = [
  { brand: 'ALFA ROMEO', model: 'Giulietta', yearStart: 2010, yearEnd: 2020 },
  { brand: 'ALFA ROMEO', model: 'Giulia', yearStart: 2016 },
  { brand: 'ALFA ROMEO', model: 'Stelvio', yearStart: 2017 },
  { brand: 'ALFA ROMEO', model: 'Tonale', yearStart: 2022 },
  { brand: 'AUDI', model: 'A1', yearStart: 2010 },
  { brand: 'AUDI', model: 'A3', yearStart: 2012 },
  { brand: 'AUDI', model: 'A4', yearStart: 2008 },
  { brand: 'AUDI', model: 'Q3', yearStart: 2011 },
  { brand: 'AUDI', model: 'Q5', yearStart: 2008 },
  { brand: 'BMW', model: 'Serie 1', yearStart: 2004 },
  { brand: 'BMW', model: 'Serie 3', yearStart: 2005 },
  { brand: 'BMW', model: 'X1', yearStart: 2009 },
  { brand: 'BMW', model: 'X3', yearStart: 2003 },
  { brand: 'CITROEN', model: 'C3', yearStart: 2002 },
  { brand: 'CITROEN', model: 'C4', yearStart: 2004 },
  { brand: 'DACIA', model: 'Sandero', yearStart: 2008 },
  { brand: 'DACIA', model: 'Duster', yearStart: 2010 },
  { brand: 'FIAT', model: '500', yearStart: 2007 },
  { brand: 'FIAT', model: 'Panda', yearStart: 2003 },
  { brand: 'FIAT', model: 'Punto', yearStart: 2003 },
  { brand: 'FIAT', model: 'Tipo', yearStart: 2015 },
  { brand: 'FORD', model: 'Fiesta', yearStart: 2002 },
  { brand: 'FORD', model: 'Focus', yearStart: 2004 },
  { brand: 'FORD', model: 'Kuga', yearStart: 2008 },
  { brand: 'HYUNDAI', model: 'i10', yearStart: 2007 },
  { brand: 'HYUNDAI', model: 'i20', yearStart: 2008 },
  { brand: 'HYUNDAI', model: 'Tucson', yearStart: 2004 },
  { brand: 'JEEP', model: 'Renegade', yearStart: 2014 },
  { brand: 'JEEP', model: 'Compass', yearStart: 2016 },
  { brand: 'KIA', model: 'Picanto', yearStart: 2004 },
  { brand: 'KIA', model: 'Sportage', yearStart: 2004 },
  { brand: 'LANCIA', model: 'Ypsilon', yearStart: 2003 },
  { brand: 'MERCEDES', model: 'Classe A', yearStart: 1997 },
  { brand: 'MERCEDES', model: 'Classe C', yearStart: 1993 },
  { brand: 'MERCEDES', model: 'Classe E', yearStart: 1993 },
  { brand: 'NISSAN', model: 'Qashqai', yearStart: 2006 },
  { brand: 'NISSAN', model: 'Juke', yearStart: 2010 },
  { brand: 'OPEL', model: 'Corsa', yearStart: 2000 },
  { brand: 'OPEL', model: 'Astra', yearStart: 2004 },
  { brand: 'PEUGEOT', model: '208', yearStart: 2012 },
  { brand: 'PEUGEOT', model: '308', yearStart: 2007 },
  { brand: 'PEUGEOT', model: '3008', yearStart: 2008 },
  { brand: 'RENAULT', model: 'Clio', yearStart: 2001 },
  { brand: 'RENAULT', model: 'Captur', yearStart: 2013 },
  { brand: 'RENAULT', model: 'Megane', yearStart: 2002 },
  { brand: 'SEAT', model: 'Ibiza', yearStart: 2002 },
  { brand: 'SEAT', model: 'Leon', yearStart: 2005 },
  { brand: 'SKODA', model: 'Fabia', yearStart: 2001 },
  { brand: 'SKODA', model: 'Octavia', yearStart: 2004 },
  { brand: 'SMART', model: 'Fortwo', yearStart: 2000 },
  { brand: 'SUZUKI', model: 'Swift', yearStart: 2004 },
  { brand: 'SUZUKI', model: 'Vitara', yearStart: 2005 },
  { brand: 'TESLA', model: 'Model 3', yearStart: 2017 },
  { brand: 'TESLA', model: 'Model Y', yearStart: 2020 },
  { brand: 'TOYOTA', model: 'Yaris', yearStart: 2001 },
  { brand: 'TOYOTA', model: 'Corolla', yearStart: 2004 },
  { brand: 'TOYOTA', model: 'RAV4', yearStart: 2000 },
  { brand: 'VOLKSWAGEN', model: 'Polo', yearStart: 2002 },
  { brand: 'VOLKSWAGEN', model: 'Golf', yearStart: 2000 },
  { brand: 'VOLKSWAGEN', model: 'T-Cross', yearStart: 2019 },
  { brand: 'VOLKSWAGEN', model: 'Tiguan', yearStart: 2007 },
  { brand: 'VOLVO', model: 'XC40', yearStart: 2017 },
  { brand: 'VOLVO', model: 'XC60', yearStart: 2008 },
];

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    await VehicleCatalog.deleteMany({});
    const created = await VehicleCatalog.insertMany(vehicles);
    const brands = [...new Set(created.map(v => v.brand))];
    console.log(`✅ ${created.length} modelli inseriti (${brands.length} marche):`);
    brands.forEach(b => console.log(`   ${b}: ${created.filter(v => v.brand === b).length} modelli`));
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Errore:', err.message);
    process.exit(1);
  });
