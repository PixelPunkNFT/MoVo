// Script per popolare i locali latini di Roma
// Uso: node scripts/seedVenues.js

const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: require('path').join(__dirname, '..', '.env') });

const Venue = require('../models/Venue.model');

const venues = [
  { name: 'Qubè', address: 'Via di Portonaccio, 212', city: 'Roma', type: 'Club Latino', description: 'Il tempio della salsa e bachata a Roma', music: ['salsa', 'bachata', 'reggaeton'], location: { coordinates: [12.5533, 41.9028] } },
  { name: 'Alpheus', address: 'Via del Commercio, 36', city: 'Roma', type: 'Discoteca Latina', description: 'Storica discoteca latina con 3 sale', music: ['salsa', 'bachata', 'merengue'], location: { coordinates: [12.5155, 41.8800] } },
  { name: 'Rashomon Club', address: 'Via degli Argonauti, 16', city: 'Roma', type: 'Club', description: 'Club alternativo con musica reggaeton', music: ['reggaeton', 'latin pop'], location: { coordinates: [12.4726, 41.8600] } },
  { name: 'Circolo degli Artisti', address: 'Via Casilina Vecchia, 42', city: 'Roma', type: 'Live Music & Club', description: 'Musica dal vivo, salsa e kizomba', music: ['salsa', 'kizomba', 'bachata'], location: { coordinates: [12.5172, 41.8850] } },
  { name: 'Goa Club', address: 'Via Libetta, 13', city: 'Roma', type: 'Discoteca', description: 'Famoso club con serate reggaeton', music: ['reggaeton', 'latino'], location: { coordinates: [12.5412, 41.8700] } },
];

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    await Venue.deleteMany({});
    const created = await Venue.insertMany(venues);
    console.log(`✅ ${created.length} locali inseriti con successo!`);
    created.forEach(v => console.log(`   - ${v.name} (${v.address})`));
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Errore:', err.message);
    process.exit(1);
  });
