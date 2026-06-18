import { Link } from 'react-router-dom';
import { colors } from '../config/theme';

export default function PrivacyPolicyPage() {
  return (
    <div style={s.container}>
      <div style={s.card}>
        <div style={s.brand}>
          <img src="/Movo.png" alt="Movo" style={{ height: 192, width: 'auto' }} />
        </div>

        <section style={s.section}>
          <h2 style={s.h2}>Informativa sulla Privacy</h2>
          <p style={s.p}>Ultimo aggiornamento: Giugno 2026</p>
          <p style={s.p}>
            Movo ("noi", "ci", "nostro") gestisce la piattaforma Movo (il "Servizio"),
            un servizio di community dedicato alla community latina di Roma per la condivisione
            di passaggi in auto e la rivendita di biglietti per eventi.
          </p>
        </section>

        <section style={s.section}>
          <h2 style={s.h2}>1. Titolare del Trattamento</h2>
          <p style={s.p}>
            Il titolare del trattamento dei dati è Movo. Per qualsiasi richiesta relativa
            ai tuoi dati personali, puoi contattarci via email all'indirizzo indicato nella
            sezione "Contatti" di questa informativa.
          </p>
        </section>

        <section style={s.section}>
          <h2 style={s.h2}>2. Dati Raccolti</h2>
          <p style={s.p}>Raccogliamo i seguenti dati personali:</p>
          <ul style={s.ul}>
            <li><strong>Dati di registrazione:</strong> nome, cognome, email, numero di telefono, data di nascita, genere.</li>
            <li><strong>Dati di veicolo:</strong> targa, marca, modello, colore, anno, foto del veicolo (forniti volontariamente).</li>
            <li><strong>Dati di annunci:</strong> foto dei biglietti caricate per la rivendita.</li>
            <li><strong>Dati di utilizzo:</strong> cronologia passaggi, prenotazioni, recensioni, messaggi in chat.</li>
            <li><strong>Dati di geolocalizzazione:</strong> città di partenza e destinazione dei passaggi.</li>
            <li><strong>Cookie tecnici:</strong> necessari per il funzionamento del Servizio.</li>
          </ul>
        </section>

        <section style={s.section}>
          <h2 style={s.h2}>3. Base Giuridica del Trattamento</h2>
          <p style={s.p}>Il trattamento dei tuoi dati si basa sulle seguenti basi giuridiche (Art. 6 GDPR):</p>
          <ul style={s.ul}>
            <li><strong>Esecuzione del contratto:</strong> per erogare il Servizio e gestire la tua registrazione.</li>
            <li><strong>Consenso:</strong> per l'invio di comunicazioni di marketing e l'uso di cookie opzionali.</li>
            <li><strong>Obbligo legale:</strong> per adempiere a obblighi fiscali, contabili e normativi.</li>
            <li><strong>Legittimo interesse:</strong> per migliorare il Servizio, prevenire frodi e garantire la sicurezza della piattaforma.</li>
          </ul>
        </section>

        <section style={s.section}>
          <h2 style={s.h2}>4. Finalità del Trattamento</h2>
          <p style={s.p}>I tuoi dati vengono utilizzati per:</p>
          <ul style={s.ul}>
            <li>Gestire la registrazione e l'autenticazione dell'account.</li>
            <li>Permettere la pubblicazione di passaggi in auto e annunci di rivendita biglietti.</li>
            <li>Facilitare la comunicazione tra utenti tramite chat interna.</li>
            <li>Verificare l'identità tramite OTP via email per prevenire abusi.</li>
            <li>Monitorare e limitare attività fraudolente (limite di 5 annunci/giorno).</li>
            <li>Migliorare il Servizio tramite analisi statistiche aggregate.</li>
            <li>Inviare notifiche relative ad attività sulla piattaforma.</li>
          </ul>
        </section>

        <section style={s.section}>
          <h2 style={s.h2}>5. Cookie</h2>
          <p style={s.p}>
            Utilizziamo cookie tecnici necessari per il funzionamento del Servizio (autenticazione,
            sessione, preferenze). I cookie analitici e di marketing sono opzionali e attivabili
            solo con il tuo consenso esplicito. Puoi gestire le tue preferenze in qualsiasi momento
            tramite il banner cookie presente nell'applicazione.
          </p>
          <table style={s.table}>
            <thead>
              <tr><th style={s.th}>Tipo</th><th style={s.th}>Finalità</th><th style={s.th}>Durata</th></tr>
            </thead>
            <tbody>
              <tr><td style={s.td}>Tecnici</td><td style={s.td}>Autenticazione, sessione, sicurezza</td><td style={s.td}>Sessione / 30 giorni</td></tr>
              <tr><td style={s.td}>Analitici</td><td style={s.td}>Analisi traffico e miglioramento servizio</td><td style={s.td}>12 mesi</td></tr>
              <tr><td style={s.td}>Marketing</td><td style={s.td}>Contenuti e annunci personalizzati</td><td style={s.td}>12 mesi</td></tr>
            </tbody>
          </table>
        </section>

        <section style={s.section}>
          <h2 style={s.h2}>6. Condivisione dei Dati</h2>
          <p style={s.p}>I tuoi dati possono essere condivisi con:</p>
          <ul style={s.ul}>
            <li><strong>Altri utenti:</strong> nome, cognome, foto profilo, valutazione e numero di telefono sono visibili ad altri utenti per permettere il contatto per passaggi e vendite.</li>
            <li><strong>Fornitori di servizi:</strong> Cloudinary (hosting immagini), provider di hosting del server.</li>
            <li><strong>Autorità:</strong> se richiesto dalla legge o per proteggere i diritti legali.</li>
          </ul>
          <p style={s.p}>I tuoi dati non vengono venduti a terzi per scopi commerciali.</p>
        </section>

        <section style={s.section}>
          <h2 style={s.h2}>7. Conservazione dei Dati</h2>
          <p style={s.p}>
            Conserviamo i tuoi dati per tutta la durata del tuo account. Dopo la cancellazione
            dell'account, i dati vengono anonimizzati o eliminati entro 30 giorni, salvo obblighi
            legali di conservazione (dati fiscali: 10 anni).
          </p>
        </section>

        <section style={s.section}>
          <h2 style={s.h2}>8. Diritti dell'Interessato (Art. 15-22 GDPR)</h2>
          <p style={s.p}>Hai il diritto di:</p>
          <ul style={s.ul}>
            <li><strong>Accesso:</strong> ottenere conferma dell'esistenza dei tuoi dati e accedervi.</li>
            <li><strong>Rettifica:</strong> correggere dati inesatti o incompleti.</li>
            <li><strong>Cancellazione:</strong> richiedere la cancellazione dei tuoi dati (diritto all'oblio).</li>
            <li><strong>Limitazione:</strong> limitare il trattamento in determinate circostanze.</li>
            <li><strong>Portabilità:</strong> ricevere i tuoi dati in formato leggibile.</li>
            <li><strong>Opposizione:</strong> opporti al trattamento per marketing diretto.</li>
            <li><strong>Revoca del consenso:</strong> revocare il consenso in qualsiasi momento.</li>
            <li><strong>Reclamo:</strong> presentare reclamo al Garante per la Protezione dei Dati Personali.</li>
          </ul>
          <p style={s.p}>
            Per esercitare i tuoi diritti, contattaci all'email indicata nella sezione "Contatti".
            Risponderemo entro 30 giorni.
          </p>
        </section>

        <section style={s.section}>
          <h2 style={s.h2}>9. Esclusione di Responsabilità</h2>
          <p style={s.p}>
            Movo è una piattaforma di incontro tra utenti e non partecipa direttamente
            alle transazioni tra venditore e acquirente né ai passaggi in auto condivisi.
          </p>
          <p style={s.p}>
            <strong>Movo non è responsabile per:</strong>
          </p>
          <ul style={s.ul}>
            <li>La veridicità delle informazioni inserite negli annunci di vendita biglietti.</li>
            <li>La validità, autenticità o fruibilità dei biglietti oggetto di rivendita.</li>
            <li>Eventuali controversie, danni, perdite o problematiche derivanti dall'incontro
                tra venditore e acquirente.</li>
            <li>L'effettiva erogazione del passaggio in auto condiviso.</li>
            <li>Il comportamento degli utenti durante il viaggio o la transazione.</li>
            <li>Danni a persone o cose durante l'utilizzo del Servizio.</li>
          </ul>
          <p style={s.p}>
            Il Servizio è fornito "così com'è" e "come disponibile", con lo scopo esclusivo
            di facilitare l'incontro tra utenti della community. Non traiamo profitto diretto
            dalle transazioni tra utenti — il servizio è offerto a supporto della community
            latina di Roma.
          </p>
        </section>

        <section style={s.section}>
          <h2 style={s.h2}>10. Sicurezza dei Dati</h2>
          <p style={s.p}>
            Adottiamo misure tecniche e organizzative adeguate per proteggere i tuoi dati
            personali da accessi non autorizzati, distruzione, perdita o alterazione:
            crittografia delle password (bcrypt), connessioni HTTPS, JWT per autenticazione,
            e accesso limitato ai dati personali.
          </p>
        </section>

        <section style={s.section}>
          <h2 style={s.h2}>11. Moderazione e Segnalazioni</h2>
          <p style={s.p}>
            Gli utenti possono segnalare annunci o altri utenti inappropriati tramite
            l'apposita funzione nella piattaforma. Ci riserviamo il diritto di rimuovere
            contenuti e sospendere account che violano i termini di servizio o la legge.
          </p>
        </section>

        <section style={s.section}>
          <h2 style={s.h2}>12. Modifiche all'Informativa</h2>
          <p style={s.p}>
            Ci riserviamo il diritto di aggiornare questa informativa in qualsiasi momento.
            Le modifiche saranno comunicate tramite notifica sulla piattaforma. Il
            proseguimento dell'utilizzo del Servizio dopo le modifiche costituisce
            accettazione della nuova informativa.
          </p>
        </section>

        <section style={s.section}>
          <h2 style={s.h2}>13. Contatti</h2>
          <p style={s.p}>
            Per esercitare i tuoi diritti o per qualsiasi domanda relativa alla privacy:
          </p>
          <p style={s.p}>
            <strong>Email:</strong> privacy@movo.it<br />
            <strong>Piattaforma:</strong> Movo — Community latina di Roma
          </p>
        </section>

        <Link to="/login" style={s.btn}>← Torna alla home</Link>
      </div>
    </div>
  );
}

const s = {
  container: {
    minHeight: '100vh', background: colors.bg, display: 'flex', justifyContent: 'center',
    padding: '40px 16px',
  },
  card: {
    width: '100%', maxWidth: 700, background: colors.surface, borderRadius: 20,
    padding: '32px 28px', border: `1px solid ${colors.glassBorder}`,
  },
  brand: { textAlign: 'center', marginBottom: 32 },
  brandName: { fontSize: 28, fontWeight: 800, margin: '8px 0 0' },
  section: { marginBottom: 28 },
  h2: { fontSize: 18, fontWeight: 700, margin: '0 0 12px', color: colors.gold },
  p: { fontSize: 13, color: colors.textSecondary, lineHeight: 1.7, margin: '0 0 10px' },
  ul: { fontSize: 13, color: colors.textSecondary, lineHeight: 1.8, paddingLeft: 20, margin: '0 0 12px' },
  table: { width: '100%', borderCollapse: 'collapse', marginTop: 12, fontSize: 12 },
  th: { textAlign: 'left', padding: '8px 12px', borderBottom: `1px solid ${colors.glassBorder}`, color: colors.textPrimary, fontWeight: 600 },
  td: { padding: '8px 12px', borderBottom: `1px solid ${colors.glassBorder}`, color: colors.textSecondary },
  btn: {
    display: 'inline-block', marginTop: 12, padding: '12px 24px',
    background: colors.goldGradient, color: '#0F1115', fontWeight: 700, fontSize: 14,
    borderRadius: 14, textDecoration: 'none', boxShadow: '0 4px 16px rgba(212,175,55,0.25)',
  },
};
