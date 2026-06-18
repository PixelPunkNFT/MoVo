const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: require('path').join(__dirname, '..', '.env') });

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    const db = mongoose.connection.db;
    try {
      await db.collection('users').dropIndex('googleId_1');
      console.log('✅ Indice googleId_1 rimosso con successo');
    } catch (err) {
      if (err.code === 27) {
        console.log('ℹ️ L\'indice googleId_1 non esiste');
      } else {
        throw err;
      }
    }
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Errore:', err.message);
    process.exit(1);
  });
