/**
 * ============================================================
 * ESERCIZIO 10 — Live Coding: Array, Map, Set & OOP
 * ============================================================
 *
 * REGOLE (simula uno screen di live coding reale):
 *   - Niente appunti. Nessun scaffolding fornito.
 *   - Di' la complessità AD ALTA VOCE prima di scrivere la funzione.
 *   - Se ci sono errori TypeScript, correggili — contano.
 *   - Obiettivo: ~5 minuti per task.
 *
 * Argomenti coperti (dal pool Tier 7):
 *   Map · Set · loop a singolo passaggio · O(n) vs O(n²)
 *   OOP: classi, incapsulamento, relazioni tra oggetti
 *   Palindromo · anagramma · array ordinato · matrice identità
 *
 * SCALA DI AIUTI (usala in ordine se sei bloccato):
 *   1. Quali sono gli input e gli output?
 *   2. Quale struttura dati mi dà O(1) in lookup?
 *   3. Posso farlo in un singolo passaggio?
 */

// ═══════════════════════════════════════════════════════════
// TASK 1 — CONTA LE OCCORRENZE
// ═══════════════════════════════════════════════════════════
//
// Dato un array di stringhe, restituisci una Map<string, number>
// dove il valore indica quante volte appare ogni stringa.
// Obiettivo: O(n) — singolo passaggio, nessun loop annidato.
//
// Esempio:
//   countOccurrences(['cane','gatto','gatto','mucca','mucca','mucca'])
//   → Map { 'cane' → 1, 'gatto' → 2, 'mucca' → 3 }
//
// Complessità attesa: O(n) tempo, O(k) spazio (k = parole uniche)

function countOccurrences(words: string[]): Map<string, number> {
  const map = new Map<string, number>();
  words.forEach(word => map.set(word, (map.get(word) ?? 0) + 1));
  //   words.forEach(word => map.set(word, (map.get(word) ?? 0) + 1));
  return map;
}

// ═══════════════════════════════════════════════════════════
// TASK 2 — ARRAY ORDINATO?
// ═══════════════════════════════════════════════════════════
//
// Dato un number[], restituisci true se è ordinato in modo crescente.
// Obiettivo: O(n) — NON usare .sort().
//
// Esempio:
//   isSorted([1, 2, 3, 4]) → true
//   isSorted([1, 4, 2, 3]) → false
//   isSorted([])            → true  (un array vuoto è ordinato)
//
// Complessità attesa: O(n) tempo, O(1) spazio

// ── VERSIONE SEMPLICE — sort O(n log n) ──────────────────
// Crea una copia ordinata e confronta: se è uguale all'originale → era già ordinato.
// Svantaggio: O(n log n) e alloca un nuovo array.
function isSorted(arr: number[]): boolean {
  return [...arr].sort((a, b) => a - b).every((val, i) => val === arr[i]);
}

// ── VERSIONE OTTIMALE — every O(n) ───────────────────────
// Controlla ogni coppia adiacente: se trovi un'inversione → false.
function isSortedFast(arr: number[]): boolean {
  return arr.every((val, i) => i === 0 || arr[i - 1] <= val);
}

// ═══════════════════════════════════════════════════════════
// TASK 3 — CONTROLLO ANAGRAMMA
// ═══════════════════════════════════════════════════════════
//
// Date due stringhe a e b, restituisci true se sono anagrammi
// (stessi caratteri, stesse frequenze, l'ordine non conta).
// Obiettivo: O(n) — usa una Map per la frequenza dei caratteri.
//
// Esempio:
//   isAnagram('listen', 'silent') → true
//   isAnagram('hello',  'world')  → false
//   isAnagram('abc',    'ab')     → false   (lunghezze diverse)
//
// Complessità attesa: O(n) tempo, O(k) spazio (k = caratteri unici)

// ── VERSIONE SEMPLICE — sort O(n log n) ──────────────────
// Ordina entrambe le stringhe e confronta: se sono uguali → anagrammi.
// Svantaggio: sort() è O(n log n), non O(n).
function isAnagram(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  return [...a].sort().join('') === [...b].sort().join('');
}

// ── VERSIONE OTTIMALE — Map O(n) ─────────────────────────
// Conta le frequenze di a (+1), poi scala con b (-1).
// Se tutti i valori finali sono 0 → anagrammi.
function isAnagramFast(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  const freq = new Map<string, number>();
  a.split('').forEach(c => freq.set(c, (freq.get(c) ?? 0) + 1));
  b.split('').forEach(c => freq.set(c, (freq.get(c) ?? 0) - 1));
  return [...freq.values()].every(v => v === 0);
}

// ═══════════════════════════════════════════════════════════
// TASK 4 — PAROLE SENZA LETTERE RIPETUTE
// ═══════════════════════════════════════════════════════════
//
// Data una stringa (frase), restituisci solo le parole senza lettere ripetute.
// Obiettivo: O(n * k) dove k = lunghezza media parola — usa un Set per parola.
//
// Esempio:
//   wordsWithUniqueLetters('la casa è bella')
//   → ['la', 'è']
//   ('casa' ha la 'a' ripetuta, 'bella' ha la 'l' ripetuta)
//
// Complessità attesa: O(n * k) tempo, O(k) spazio

// ── VERSIONE SEMPLICE — Set.size O(n * k) ───────────────
// Se tutti i caratteri sono unici, il Set ha la stessa dimensione della parola.
function wordsWithUniqueLetters(sentence: string): string[] {
  return sentence.split(' ').filter(word => new Set(word).size === word.length);
}

// ═══════════════════════════════════════════════════════════
// TASK 5 — PALINDROMO
// ═══════════════════════════════════════════════════════════
//
// Restituisci true se la stringa si legge uguale da sinistra a destra e viceversa.
// Implementa DUE versioni:
//   a) Due puntatori — O(n) tempo, O(1) spazio
//   b) Inversione e confronto (split/reverse/join) — O(n) tempo, O(n) spazio
// Poi spiega il trade-off: la versione b) crea una nuova stringa (spazio extra),
// la versione a) usa solo indici (nessuna allocazione).
//
// Esempio:
//   isPalindromePointer('racecar') → true
//   isPalindromePointer('ciao')    → false
//   isPalindromeReverse('level')   → true

function palindromo(p: string): boolean {
  return p === p.split('').reverse().join('');
}

function palindromoC(p: string): boolean {
  let left = 0;
  let right = p.length - 1;
  while (left < right) {
    if (p[left] !== p[right]) {
      return false;
    }
    left++;
    right--;
  }
  return true;
}

// ═══════════════════════════════════════════════════════════
// TASK 6 — MATRICE IDENTITÀ
// ═══════════════════════════════════════════════════════════
//
// Data una matrice n×n (number[][]), restituisci true se è una matrice identità:
// 1 sulla diagonale principale, 0 ovunque else.
// Non puoi evitare O(n²) qui — spiega perché.
//
// Esempio:
//   isIdentityMatrix([[1,0,0],[0,1,0],[0,0,1]]) → true
//   isIdentityMatrix([[1,0,0],[0,0,0],[0,0,1]]) → false
//
// Complessità attesa: O(n²) tempo, O(1) spazio
// Perché non puoi evitare O(n²): devi controllare ogni cella della matrice —
// sono n² celle, non puoi sapere se è identità senza guardarle tutte.

function isIdentityMatrix(matrix: number[][]): boolean {
  return matrix.every((row, i) =>
    row.every((val, j) => val === (i === j ? 1 : 0))
  );
}

// ═══════════════════════════════════════════════════════════
// TASK 7 — OOP: RISTORANTE
// ═══════════════════════════════════════════════════════════
//
// Modella un sistema ristorante con queste classi:
//
//   MenuItem   { name: string, price: number }
//              → usa il costruttore shortcut TypeScript (public name, public price)
//
//   Order      { addItem(item): void
//                applyDiscount(percent: number): void
//                getTotal(): number  ← somma prezzi con sconto applicato }
//              → discount default 0, items default []
//              → getTotal applica: subtotale * (1 - discount / 100)
//
//   Table      { number: number
//                startOrder(): void
//                getOrder(): Order | null }
//              → currentOrder default null, impostato da startOrder()
//
//   Restaurant { addTable(table): void
//                getTable(number): Table | undefined
//                getTablesWithOrders(): Table[]  ← solo i tavoli con un ordine attivo }
//
// Poi in fondo scrivi un demo d'uso che:
//   1. Crea un Restaurant
//   2. Aggiunge 2 tavoli
//   3. Fa ordinare solo il tavolo 1 (aggiungi almeno 2 piatti)
//   4. Applica uno sconto del 10% all'ordine
//   5. Stampa il totale con console.log
//   6. Stampa quanti tavoli hanno un ordine attivo

// ─────────────────────────────────────────────────────────
// Scrivi le tue implementazioni qui sotto
// ─────────────────────────────────────────────────────────

class MenuItem {
  constructor(
    public price: number,
    public item: string = 'Cannolo'
  ) {}
}

class Order {
  private items: MenuItem[] = [];

  constructor(public discount: number = 0) {}

  addItem(MenuItem): void {
    this.items.push(MenuItem);
  }

  getTotal(): number {
    const subtotale = this.items.reduce((sum, v) => sum + v.price, 0);
    return subtotale * (1 - this.discount / 100);
  }
}

class Table {
  private order: Order | null = null;

  constructor(public tableNo: number = 0) {}

  newOrder(discount: number): void {
    this.order = new Order(discount);
  }

  getOrder(): Order | null {
    return this.order;
  }
}

class Restaurant {
  private tables: Table[] = [];

  addTable(Table): void {
    this.tables.push(Table);
  }

  getTable(number: number): Table | undefined {
    return this.tables.find(t => t.tableNo === number);
  }

  getTablesWithOrders(): Table[] {
    return this.tables.filter(t => t.getOrder() !== null);
  }
}

const restaurant = new Restaurant();

restaurant.addTable(new Table(1));
restaurant.addTable(new Table(2));

restaurant.getTable(1).newOrder(10);
restaurant.getTable(1).getOrder().addItem(new MenuItem(10, 'lamo'));
restaurant.getTable(1).getOrder().addItem(new MenuItem(11, 'lame'));

console.log(restaurant.getTable(1).getOrder().getTotal());
console.log(restaurant.getTablesWithOrders().length);

// ═══════════════════════════════════════════════════════════
// TASK 9 — ESERCIZIO GUIDATO: HAI VISTO QUESTO TICKER?
// ═══════════════════════════════════════════════════════════
//
// Contesto: hai un feed di ticker che arrivano in streaming.
// Devi sapere, per ogni ticker in arrivo, se lo hai già visto prima.
//
// Funzione: haVistoPrima(feed: string[]): string[]
// Restituisci un array di label:
//   - 'NUOVO'     se è la prima volta che appare
//   - 'DUPLICATO' se lo hai già visto
//
// Esempio:
//   haVistoPrima(['AAPL', 'MSFT', 'AAPL', 'GOOG', 'MSFT'])
//   → ['NUOVO', 'NUOVO', 'DUPLICATO', 'NUOVO', 'DUPLICATO']
//
// ── GUIDA PASSO PER PASSO ────────────────────────────────
//
// PASSO 1: di che struttura dati hai bisogno?
//   Devi rispondere a "ho già visto questo ticker?" in O(1).
//   → ??? (Set o Map?)
//   HINT: non ti serve memorizzare un valore associato — solo presenza/assenza.
//         Quale struttura è fatta esattamente per questo?
//
// PASSO 2: cosa fai per ogni ticker nel feed?
//   - controlla se è già nella struttura → se sì: label = ???
//   - se no: label = ???, e aggiungi il ticker alla struttura
//
// PASSO 3: quale metodo usi per costruire l'array risultato?
//   Trasformi ogni elemento in qualcos'altro → ???
//
// Complessità attesa: O(n) tempo, O(k) spazio (k = ticker unici)
// ─────────────────────────────────────────────────────────

function haVistoPrima(feed: string[]): string[] {
  const visti = new Set<string>();
  return feed.map(ticker => {
    if (visti.has(ticker)) return 'DUPLICATO';
    visti.add(ticker);
    return 'NUOVO';
  });
}

// console.log(haVistoPrima(['AAPL', 'MSFT', 'AAPL', 'GOOG', 'MSFT']));
// → ['NUOVO', 'NUOVO', 'DUPLICATO', 'NUOVO', 'DUPLICATO']

// ═══════════════════════════════════════════════════════════
// TASK 10 — TROVA I CLIENTI DUPLICATI (forEach→map O(n²) vs Map O(n))
// ═══════════════════════════════════════════════════════════
//
// Dato un array di nomi clienti, restituisci solo quelli
// che appaiono PIÙ DI UNA VOLTA (senza ripetizioni nel risultato).
//
// Esempio:
//   clientiDuplicati(['Alice', 'Bob', 'Alice', 'Carlo', 'Bob', 'Bob'])
//   → ['Alice', 'Bob']
//
// ── VERSIONE O(n²) — forEach annidato con includes ────────
// Per ogni nome, scorri di nuovo tutto l'array per contare → O(n) × O(n) = O(n²)

function clientiDuplicatiSlow(nomi: string[]): string[] {
  const duplicati: string[] = [];

  nomi.forEach(nome => {
    const conteggio = nomi.filter(n => n === nome).length; // ← O(n) dentro O(n)
    if (conteggio > 1 && !duplicati.includes(nome)) {
      // ← includes è O(n) pure lui
      duplicati.push(nome);
    }
  });

  return duplicati;
}
// forEach  → O(n)
//   filter → O(n)   ← annidato = O(n²) totale
//   includes → O(n) ← terzo ciclo nascosto = O(n³) nel peggio!

// ── VERSIONE O(n) — Map per contare, Set per deduplicare ──

function clientiDuplicatiFast(nomi: string[]): string[] {
  const conteggi = new Map<string, number>();

  nomi.forEach(nome => {
    conteggi.set(nome, (conteggi.get(nome) ?? 0) + 1); // O(1) per ogni nome
  });

  return nomi
    .filter(nome => conteggi.get(nome)! > 1) // tieni solo chi appare più volte
    .filter((nome, i, arr) => arr.indexOf(nome) === i); // deduplica: tieni solo prima occorrenza
}
// forEach  → O(n)   un passaggio per costruire la Map
// filter   → O(n)   un passaggio per filtrare
// = O(n) totale

console.log(
  clientiDuplicatiFast(['Alice', 'Bob', 'Alice', 'Carlo', 'Bob', 'Bob'])
);
// → ['Alice', 'Bob']
