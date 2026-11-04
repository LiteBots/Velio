// Aktualizacja cen w działającej bazie: stare wartości się zmieniają, a ręczne zmiany z panelu zostają.
import test from 'node:test';
import assert from 'node:assert/strict';

for (const k of ['MONGO_URL', 'MONGODB_URI', 'MONGO_PUBLIC_URL', 'RAILWAY_ENVIRONMENT', 'RAILWAY_PROJECT_ID']) delete process.env[k];
process.env.NODE_ENV = 'test';
const { connectDb, insert, findOne, col } = await import('../server/db/index.js');
const { applyPriceUpdate } = await import('../server/web/content.js');

test('zmienia tylko nietknięte ceny i teksty, i robi to raz', async () => {
  await connectDb();
  const store = await insert('price_items', { name: 'Sklep internetowy', price: 4990 });
  const edited = await insert('price_items', { name: 'Landing page pod kampanię', price: 1200 });
  const post = await insert('posts', { slug: 'ile-kosztuje-strona-internetowa', body: 'Sklep od ok. 5 000 zł. Dalej mój tekst.' });
  const own = await insert('locals', { slug: 'agencja-marketingowa-miastko', body: 'Własny tekst bez ceny.' });

  await applyPriceUpdate();

  assert.equal((await findOne('price_items', { id: store.id })).price, 1390);
  assert.equal((await findOne('price_items', { id: edited.id })).price, 1200);
  assert.equal((await findOne('posts', { id: post.id })).body, 'Sklep od ok. 1 400 zł. Dalej mój tekst.');
  assert.equal((await findOne('locals', { id: own.id })).body, 'Własny tekst bez ceny.');

  // Późniejsza zmiana w panelu nie jest nadpisywana przy kolejnym starcie serwera
  await col('price_items').updateOne({ id: store.id }, { $set: { price: 4990 } });
  await applyPriceUpdate();
  assert.equal((await findOne('price_items', { id: store.id })).price, 4990);
});
