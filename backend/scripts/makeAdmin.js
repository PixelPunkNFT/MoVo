// Script per promuovere un utente ad amministratore
// Uso: node scripts/makeAdmin.js email@example.com

const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: require('path').join(__dirname, '..', '.env') });

const User = require('../models/User.model');

const email = process.argv[2];
if (!email) {
  console.error('❌ Uso: node scripts/makeAdmin.js email@example.com');
  process.exit(1);
}

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    const user = await User.findOneAndUpdate(
      { email },
      { role: 'admin' },
      { new: true }
    );
    if (user) {
      console.log(`✅ ${user.firstName} ${user.lastName} (${user.email}) è ora amministratore!`);
    } else {
      console.log('❌ Utente non trovato');
    }
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Errore:', err.message);
    process.exit(1);
  });
