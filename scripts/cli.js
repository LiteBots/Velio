#!/usr/bin/env node
// Narzędzia awaryjne VELIO (działają na bazie MongoDB wskazanej w MONGO_URL).
// Większość zadań wykonasz w panelu /admin (logowanie kodem ADMIN_PIN). CLI przydaje się np. do resetu hasła klienta.
// Użycie: MONGO_URL=... npm run cli -- <komenda> [opcje]
import { parseArgs } from 'node:util';
import { config } from '../server/config.js';
import { connectDb, closeDb, findAll, findOne, insert, update, removeMany, nowIso } from '../server/db/index.js';
import { hashPassword, generatePassword } from '../server/lib/auth.js';
import { createDemoAccount, seedPlatform } from '../server/db/seed.js';
import { newUserDoc } from '../server/api/public.js';

const [, , cmd = 'help', ...rest] = process.argv;
const { values: o } = parseArgs({
  args: rest, allowPositionals: true, strict: false,
  options: { email: { type: 'string' }, name: { type: 'string' }, password: { type: 'string' }, role: { type: 'string' }, company: { type: 'string' } },
});
const die = (m) => { console.error(`✖ ${m}`); process.exit(1); };

const commands = {
  help() {
    console.log(`
VELIO CLI  (baza: ${config.mongoUrl ? 'MongoDB' : 'BRAK MONGO_URL — ustaw zmienną, aby działać na prawdziwej bazie'})

  user:create   --email E --name N [--role client|staff] [--company C] [--password P]
  user:password --email E [--password P]              nowe hasło (bez --password: losowe) + wylogowanie
  user:list                                           lista kont
  admin:unlock                                        zdejmuje blokadę logowania kodem PIN po błędnych próbach
  demo                                                dane demonstracyjne (konto demo, klienci, historia)

  Panel admina: /admin — logowanie kodem ze zmiennej ADMIN_PIN (Railway → Variables).
`);
  },
  async 'admin:unlock'() {
    const r = await removeMany('login_attempts', {});
    console.log(`✔ Zdjęto blokady logowania PIN (${Number(r.deletedCount || 0)}).`);
  },
  async 'user:create'() {
    const email = String(o.email || die('Podaj --email')).toLowerCase();
    if (await findOne('users', { email })) die('Taki e-mail już istnieje.');
    const pw = o.password || generatePassword();
    const role = ['client', 'staff'].includes(o.role) ? o.role : 'client';
    await insert('users', newUserDoc({ email, password_hash: await hashPassword(pw), name: o.name || die('Podaj --name'), company: o.company || '', role, created_at: nowIso() }));
    console.log(`✔ Utworzono konto ${email} (${role})${o.password ? '' : `\n  Hasło: ${pw}`}`);
  },
  async 'user:password'() {
    const u = await findOne('users', { email: String(o.email || die('Podaj --email')).toLowerCase() }) || die('Nie ma takiego konta.');
    const pw = o.password || generatePassword();
    await update('users', { id: u.id }, { password_hash: await hashPassword(pw), status: 'active' });
    await removeMany('sessions', { user_id: u.id });
    console.log(`✔ Nowe hasło dla ${u.email}: ${pw}`);
  },
  async 'user:list'() {
    console.table((await findAll('users', {}, { sort: { id: 1 } })).map(({ id, email, name, role, status, last_login_at }) => ({ id, email, name, role, status, last_login_at })));
  },
  async demo() {
    if (await findOne('users', { email: 'demo@velio.pl' })) die('Konto demo już istnieje.');
    await createDemoAccount();
    await seedPlatform();
    console.log('✔ Klient demo: demo@velio.pl / Demo1234!  ·  panel admina: kod ADMIN_PIN');
  },
};

const fn = commands[cmd];
if (!fn) die(`Nieznana komenda: ${cmd}. Zobacz: npm run cli -- help`);
if (cmd !== 'help') await connectDb();
await fn();
await closeDb();
