# 🟤 Tier 7 — Preparazione Colloquio (02/04/26) 🇮🇹

> Versione italiana del Tier 7. Tutti gli esempi di codice in TypeScript/Angular. I concetti sono language-agnostic — i paralleli con Java sono indicati dove utile.
> ← Torna all'[indice principale](interview_coach_2026.md)

---

## ⏱️ PIANO DI STUDIO — qualche ora

| Blocco | Tempo  | Cosa                                                                                                                                                                        |
| ------ | ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1      | 20 min | [JWT](#1-jwt--autenticazione--autorizzazione) + [SOLID](#2-principi-solid)                                                                                                  |
| 2      | 20 min | [Design Patterns](#3-design-patterns-singleton--prototype) + [Big O](#4-complessità-computazionale-big-o-espanso) + [Strutture Dati](#5-strutture-dati--angolo-finanziario) |
| 3      | 30 min | [Live coding: Palindromo + Ristorante](#6-live-coding-palindromo)                                                                                                           |
| 4      | 20 min | [Esercizi array](#8-live-coding-esercizi-su-array) + [Stack / Queue / LinkedList](#9-stack-queue-e-linkedlist)                                                              |
| 5      | 20 min | [Domande Junior/Senior TS](#11-domande-juniorsenior-in-typescriptangular) + [DB: Relazionale vs NoSQL](#10-database-relazionali-vs-non-relazionali)                         |

---

## 📋 Contenuti

1. [JWT — Autenticazione & Autorizzazione](#1-jwt--autenticazione--autorizzazione)
2. [Principi SOLID](#2-principi-solid)
3. [Design Patterns: Singleton & Prototype](#3-design-patterns-singleton--prototype)
4. [Complessità Computazionale / Big O (espanso)](#4-complessità-computazionale-big-o-espanso)
5. [Strutture Dati — Angolo Finanziario](#5-strutture-dati--angolo-finanziario)
6. [Live Coding: Palindromo](#6-live-coding-palindromo)
7. [Live Coding: Ristorante (OOP)](#7-live-coding-ristorante-oop)
8. [Live Coding: Esercizi su Array](#8-live-coding-esercizi-su-array)
9. [Stack, Queue e LinkedList](#9-stack-queue-e-linkedlist)
10. [Database Relazionali vs Non-relazionali](#10-database-relazionali-vs-non-relazionali)
11. [Domande Junior/Senior in TypeScript/Angular](#11-domande-juniorsenior-in-typescriptangular)

---

## 1. JWT — Autenticazione & Autorizzazione

### 🧱 Contesto di base: come funziona il web

Quando il browser fa una richiesta HTTP al server, di default ogni richiesta è **indipendente e anonima** — il server non sa chi sei. Il protocollo HTTP è **stateless**: ogni chiamata è a sé stante.

Il problema: se l'utente fa il login, come fa il server a riconoscerlo nelle richieste successive?

Ci sono due approcci storici:

| Approccio              | Come funziona                                                                           | Problema                                                                           |
| ---------------------- | --------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| **Session (stateful)** | Il server salva una sessione in memoria/DB e ti dà un `sessionId` da mettere nel cookie | Il server deve mantenere stato — se hai più server, devono condividere le sessioni |
| **Token (stateless)**  | Il server firma un token con tutte le info necessarie e te lo dà — non salva nulla      | Il server verifica solo la firma — scala facilmente                                |

JWT è la soluzione **stateless** più diffusa.

---

### 🗣️ Risposta parlata

> "JWT — JSON Web Token — è un token compatto e auto-contenuto per trasmettere identità. Ha tre parti separate da punti: **Header** (algoritmo), **Payload** (claims — chi sei, il tuo ruolo, la scadenza), **Signature** (prova crittografica che non è stato alterato). Il server firma il token al login usando una chiave segreta. Ad ogni richiesta successiva, il client manda il token nell'header `Authorization: Bearer <token>`. Il server verifica la firma — non ha bisogno di interrogare il database, il token si auto-dimostra. Questo è ciò che rende JWT stateless."

---

### 🔧 Struttura del token

Un JWT ha questa forma:

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyMTIzIiwicm9sZSI6ImFkbWluIiwiZXhwIjoxNzEyMzQ1Njc4fQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
    ^--- HEADER (base64) ---^            ^--- PAYLOAD (base64) ---^                                 ^--- SIGNATURE ---^
```

Le tre parti sono codificate in **Base64** (non criptate!) e separate da `.`

**Header** — algoritmo usato per la firma:

```json
{
  "alg": "HS256",
  "typ": "JWT"
}
```

**Payload** — i "claims", cioè le affermazioni sull'utente:

```json
{
  "sub": "user123",       ← subject: ID dell'utente
  "role": "admin",        ← claim di autorizzazione
  "email": "a@a.com",     ← dato utente (opzionale)
  "iat": 1712000000,      ← issued at: quando è stato emesso
  "exp": 1712345678       ← expiry: quando scade (Unix timestamp)
}
```

**Signature** — la prova di integrità:

```
HMAC-SHA256(
  base64(header) + "." + base64(payload),
  SECRET_KEY
)
```

> ⚠️ **Il payload è solo Base64, non criptato** — chiunque può leggerlo decodificandolo. Non ci mettere mai password, carta di credito, o dati sensibili. Il valore del JWT è la **firma**, non la confidenzialità.

---

### 🔄 Il flusso completo (passo per passo)

```
1. Utente fa login POST /auth/login  { email, password }
        ↓
2. Server verifica le credenziali nel DB
        ↓
3. Server crea il JWT, lo firma con la SECRET_KEY
        ↓
4. Server risponde con { accessToken: "eyJ...", refreshToken: "..." }
        ↓
5. Client salva il token (localStorage o memory)
        ↓
6. Ogni richiesta successiva aggiunge l'header:
        Authorization: Bearer eyJ...
        ↓
7. Server riceve la richiesta, estrae il token dall'header
        ↓
8. Server verifica la firma con la SECRET_KEY → valida!
        ↓
9. Server legge il payload (sub, role) → sa chi sei e cosa puoi fare
```

---

### Autenticazione vs Autorizzazione

> "**Autenticazione** = chi sei tu? Fai il login con le credenziali, il server le valida ed emette un JWT. Ogni chiamata successiva presenta il JWT per provare l'identità.
> **Autorizzazione** = cosa ti è permesso fare? Il payload del JWT contiene un claim `role` — `admin`, `user`, `guest`. Il server (o un guard/interceptor) legge il ruolo e decide a cosa puoi accedere."

---

### Access Token vs Refresh Token

| Token             | Durata              | Scopo                                                   |
| ----------------- | ------------------- | ------------------------------------------------------- |
| **Access Token**  | Breve (5–15 min)    | Accesso alle API protette — mandato in ogni richiesta   |
| **Refresh Token** | Lungo (7–30 giorni) | Ottenere un nuovo access token scaduto senza fare login |

Il pattern:

```
Access token scaduto → 401 Unauthorized
        ↓
Client usa il refresh token → POST /auth/refresh
        ↓
Server emette nuovo access token
        ↓
Client riprova la richiesta originale
```

> Nel progetto Angular, l'`authInterceptor` gestisce questo automaticamente: intercetta i 401, tenta il refresh, poi fa il retry della richiesta.

---

### 🎯 Punti chiave da dire

- JWT è **stateless** — il server non salva sessioni
- La firma usa HMAC-SHA256 o RSA — modificare il payload invalida la firma
- Il token **non è criptato di default** — non ci mettere segreti (è base64, leggibile da chiunque)
- La **scadenza** (`exp`) è fondamentale — token brevi + refresh token
- Nel tuo progetto Angular: `authInterceptor` attacca `Authorization: Bearer <token>` ad ogni richiesta; `AuthStore` tiene il ruolo dell'utente corrente e governa la visibilità dei componenti

---

### 🎤 Domanda di pratica

> _"Come funziona JWT? Qual è la differenza tra autenticazione e autorizzazione?"_

---

## 2. Principi SOLID

### 🗣️ Una riga per principio (da dire a memoria)

| Lettera | Principio             | Una riga                                                                                                                  |
| ------- | --------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| **S**   | Single Responsibility | Una classe fa una cosa sola. Se cambia per due motivi diversi, dividila.                                                  |
| **O**   | Open/Closed           | Aperta all'estensione, chiusa alla modifica. Aggiungi comportamento estendendo, non modificando il codice esistente.      |
| **L**   | Liskov Substitution   | Una sottoclasse deve poter sostituire la classe padre senza rompere il programma.                                         |
| **I**   | Interface Segregation | Non forzare una classe a implementare metodi che non usa. Interfacce piccole e focalizzate > un'unica interfaccia grassa. |
| **D**   | Dependency Inversion  | Dipendi dalle astrazioni, non dalle implementazioni concrete. Inietta le dipendenze, non istanziarle tu.                  |

### Esempi concreti che ti chiederanno

**S — Single Responsibility (componenti Angular):**

In Angular la violazione più comune è il componente "Dio" — uno che fa tutto:

```ts
// ❌ Sbagliato — ProductListComponent fa fetch, filtra, renderizza le righe E gestisce l'export
@Component({ ... })
export class ProductListComponent {
  products = signal<Product[]>([]);
  filtered = computed(() => /* logica filtro */);

  ngOnInit() { /* chiama l'API */ }
  onRowClick(p: Product) { /* naviga al dettaglio */ }
  exportCsv() { /* genera e scarica il CSV */ }   // ← responsabilità extra!
  formatPrice(p: Product) { /* formatta */ }       // ← responsabilità extra!
}
```

```ts
// ✅ Giusto — ogni pezzo ha una sola ragione per cambiare
// ProductListComponent (smart) → possiede lo stato, chiama l'API
// ProductRowComponent  (dumb)  → riceve @Input(), emite @Output(), solo display
// ExportService                → sa come generare CSV, indipendente dall'UI
```

> La regola pratica: se il tuo componente cambia sia quando cambiano i requisiti di UI **sia** quando cambia il formato del CSV, ha due responsabilità — dividilo.

**O — Open/Closed (interceptors Angular):**

Il principio dice: aggiungi comportamento **senza toccare** ciò che già funziona.

```ts
// ❌ Sbagliato — ogni nuovo requisito HTTP richiede di modificare il servizio
@Injectable({ providedIn: 'root' })
export class ProductService {
  getProducts() {
    // aggiungo Auth header qui
    // aggiungo logging qui
    // aggiungo retry qui
    // ... il servizio cresce per ogni requisito trasversale
    return this.http.get<Product[]>('/api/products');
  }
}
```

```ts
// ✅ Giusto — pipeline HTTP chiusa alla modifica, aperta all'estensione via interceptors
// app.config.ts
provideHttpClient(
  withInterceptors([
    authInterceptor, // aggiunge Bearer token
    loggingInterceptor, // logga request/response
    retryInterceptor, // retry su 503
  ])
);

// Vuoi aggiungere il rate-limiting? Aggiungi rateLimit al array.
// Non tocchi ProductService, AuthService, né gli altri interceptor.
```

> Questa è **esattamente** la struttura del tuo progetto — `authInterceptor` attacca il token senza che nessun service ne sappia niente. Angular's HTTP pipeline è "chiusa", tu la "estendi" componendo interceptors.

**D — Dependency Inversion (= quello che fa la DI in Angular/Spring):**

```
Sbagliato:  class OrderService { db = new MySQLDatabase() }   ← accoppiamento duro
Giusto:     class OrderService { constructor(Database db) }   ← iniettato dall'esterno
```

> In Angular: `inject(AuthService)` — dipendi dall'astrazione, non da `new AuthService()`. Nei test puoi iniettare un mock senza cambiare una riga di `OrderService`.

### 🎤 Domanda di pratica

> _"Spiegami i principi SOLID. Dimmi un esempio di uno."_

---

## 3. Design Patterns: Singleton & Prototype

### Singleton

> "Garantisce che esista **una sola istanza** di una classe nell'intera applicazione. Utile per risorse condivise: connessioni al DB, config, logging, cache."

```ts
// TypeScript — variabile a livello di modulo (i moduli JS sono singleton per natura)
class DatabaseConnection {
  private static instance: DatabaseConnection;
  private constructor() {}

  static getInstance(): DatabaseConnection {
    if (!DatabaseConnection.instance) {
      DatabaseConnection.instance = new DatabaseConnection();
    }
    return DatabaseConnection.instance;
  }
}
```

**In Angular:** i servizi con `providedIn: 'root'` sono singleton — Angular's DI crea una sola istanza e la condivide a livello di app. È il pattern che usi ogni giorno.

```ts
// Servizio singleton Angular
@Injectable({ providedIn: 'root' })
export class AuthService { ... }  // una sola istanza, ovunque
```

### Prototype

> "Crea un **nuovo oggetto clonando** uno esistente invece di costruirlo da zero. Usato quando la creazione dell'oggetto è costosa e vuoi una copia con alcune modifiche."

#### Prima di tutto: il problema delle referenze

In JavaScript gli oggetti sono passati **per riferimento**, non per valore. Assegnare un oggetto a una nuova variabile non lo copia — crea un secondo puntatore allo stesso oggetto in memoria:

```ts
const user = { name: 'Alice', role: 'admin' };
const copy = user; // ← NON è una copia, è lo stesso oggetto!

copy.name = 'Bob';
console.log(user.name); // 'Bob' — hai modificato l'originale senza volerlo
```

Per avere un oggetto davvero indipendente devi clonarlo esplicitamente.

#### Clone superficiale (spread) — primo livello indipendente, annidati ancora condivisi

```ts
const user = { name: 'Alice', address: { city: 'Rome' } };
const shallow = { ...user };

shallow.name = 'Bob'; // ✅ originale intatto — primo livello copiato
shallow.address.city = 'Milan'; // ❌ modifica ANCHE user.address.city!
//    address è ancora un riferimento condiviso
```

#### Clone profondo (`structuredClone`) — tutto indipendente, ricorsivamente

```ts
const user = { name: 'Alice', address: { city: 'Rome' } };
const deep = structuredClone(user);

deep.address.city = 'Milan';
console.log(user.address.city); // 'Rome' — originale intatto ✅
```

**Nel tuo codebase:** `structuredClone(user)` nel SignalStore quando si entra in modalità modifica è esattamente il pattern Prototype — clona lo stato corrente in modo che Annulla possa ripristinarlo. Si usa `structuredClone` e non spread perché `User` può avere oggetti annidati.

```ts
// user.store.ts — pattern Prototype in azione
const startEditing = (user: User) => {
  updateState(state, 'User: Start Editing', {
    clonedUsers: { ...state.clonedUsers(), [user.id]: structuredClone(user) },
  });
};
```

### Singleton vs Prototype a colpo d'occhio

| Pattern   | Quando                              | Equivalente Angular                                       |
| --------- | ----------------------------------- | --------------------------------------------------------- |
| Singleton | Risorsa condivisa, una sola istanza | Servizio `providedIn: 'root'`                             |
| Prototype | Servono copie indipendenti          | `structuredClone()`, `providers: []` a livello componente |

### 🎤 Domanda di pratica

> _"Qual è la differenza tra i pattern Singleton e Prototype? Dove useresti ciascuno?"_

---

## 4. Complessità Computazionale / Big O (espanso)

### 🧱 Prima di tutto: cos'è un algoritmo?

> "Un algoritmo è una sequenza di passi finita e precisa per risolvere un problema. Come una ricetta: input → passi definiti → output."

```
Input: [3, 1, 4, 1, 5]
Algoritmo: "scorri l'array, per ogni coppia adiacente
            se il sinistro > destro → restituisci false
            altrimenti → restituisci true"
Output: false
```

Non è codice — è l'**idea**. Il codice è l'implementazione di quell'idea. Quando l'intervistatore chiede _"qual è la tua strategia?"_, ti sta chiedendo l'algoritmo, non il codice. Di' prima la strategia, poi scrivi.

---

### 🗣️ Risposta parlata

> "Big O descrive come un algoritmo scala all'aumentare dell'input — caso peggiore. I principali: O(1) è costante — lookup su HashMap, accesso array per indice. O(log n) è logaritmico — ricerca binaria, albero bilanciato. O(n) è lineare — un singolo ciclo. O(n log n) è la maggior parte degli algoritmi di ordinamento — merge sort, quicksort caso medio. O(n²) sono i cicli annidati — bubble sort, controllare tutte le coppie. La regola: quando hai una scelta, preferisci sempre la complessità più bassa. Nel live coding, l'intervistatore vuole O(n) dove possibile — se scrivi un ciclo annidato, segnalalo e spiega perché."

### La tabella che si aspettano

| Notazione  | Nome         | Esempio                        |
| ---------- | ------------ | ------------------------------ |
| O(1)       | Costante     | HashMap.get(), array[i]        |
| O(log n)   | Logaritmico  | Ricerca binaria, ricerca BST   |
| O(n)       | Lineare      | Ciclo singolo, ricerca lineare |
| O(n log n) | Linearitmico | Merge sort, Arrays.sort()      |
| O(n²)      | Quadratico   | Cicli annidati, bubble sort    |
| O(2ⁿ)      | Esponenziale | Fibonacci ricorsivo (naïve)    |

### La regola "ottimizza sempre" per il live coding

```
1 ciclo → O(n)              ✅ obiettivo
2 cicli annidati → O(n²)    ⚠️ spiega e ottimizza se richiesto
HashMap per evitare il 2° ciclo → da O(n²) a O(n)  ✅ mossa d'oro
```

### 🎤 Domanda di pratica

> _"Cos'è O(n²) e come lo ridurresti a O(n)?"_

---

## 5. Strutture Dati — Angolo Finanziario

> Le strutture dati sono i contenitori in cui organizzi i dati. La scelta giusta determina la complessità delle operazioni. Questi quattro coprono il 90% delle domande di colloquio.

### Array

> Una sequenza contigua di elementi in memoria, accessibile per indice.

- **Accesso per indice** → O(1): `prezzi[3]` va diretto alla posizione 3 in memoria, zero ricerca
- **Ricerca** → O(n): se non sai l'indice, devi scorrere tutto
- **Uso in finance:** serie storiche di prezzi `[10.5, 11.2, 12.8, ...]`, calcolo medie mobili

### Hash Table (Map in JS/TS)

**Cos'è la funzione di hash?**

Immagina un magazzino con mille scaffali numerati. Hai bisogno del prezzo di "AAPL". Invece di guardare tutti gli scaffali uno per uno, passi il nome attraverso una formula matematica — la **funzione di hash** — che lo converte in un numero, per esempio `42`. Vai direttamente allo scaffale 42. Zero ricerca.

```ts
// Internamente (semplificato):
hash("AAPL") → 42   // chiave → indice nell'array interno
hash("MSFT") → 7
hash("GOOG") → 119

// Quello che scrivi tu:
const prezzi = new Map<string, number>();
prezzi.set("AAPL", 175.30);
prezzi.get("AAPL"); // → 175.30, O(1)
```

Quando chiami `map.get("AAPL")`, JS calcola l'hash → salta direttamente a quella posizione → restituisce il valore. Nessun loop.

**E le collisioni?**

A volte due chiavi diverse producono lo stesso hash. Il `Map` lo gestisce internamente con una lista a quella posizione. In pratica è quasi sempre O(1) — il caso O(n) è teorico.

- **Lookup / Inserimento** → O(1) medio
- **Uso in finance:** ticker → prezzo, `Map<clienteId, portafoglio>`
- In JS/TS: `Map<K, V>` e oggetti `{}` sono entrambi basati su hash

### BST bilanciato / Red-Black Tree

> Albero binario dove ogni nodo ha al massimo 2 figli. "Bilanciato" = l'albero non degenera in una lista — altezza O(log n).

- **Ricerca/Inserimento** → O(log n): ad ogni nodo dimezzi lo spazio di ricerca (come la ricerca binaria)
- **Uso in finance:** **Order Book** — ordini bid/ask tenuti ordinati per prezzo. Inserzione O(log n), miglior prezzo O(1)

### Heap (Min-Heap / Max-Heap)

> Albero binario dove la radice è sempre il minimo (min-heap) o il massimo (max-heap). Ogni nodo è ≤ o ≥ dei suoi figli.

- **Peek min/max** → O(1): è sempre in cima, basta guardare
- **Inserimento/rimozione** → O(log n): l'heap si riorganizza risalendo/scendendo l'albero
- **Uso in finance:** **Priority Queue** — gli ordini più urgenti vengono eseguiti per primi

| Struttura      | Accesso      | Ricerca    | Inserimento | Uso principale  |
| -------------- | ------------ | ---------- | ----------- | --------------- |
| Array          | O(1)         | O(n)       | O(n)        | Serie storiche  |
| Hash Table     | O(1)         | O(1) medio | O(1) medio  | Ticker → prezzo |
| BST bilanciato | —            | O(log n)   | O(log n)    | Order Book      |
| Heap           | O(1) min/max | —          | O(log n)    | Priority queue  |

---

## 6. Live Coding: Palindromo

### Cos'è

Un palindromo si legge uguale da sinistra a destra e da destra a sinistra: `"racecar"`, `"level"`, `"madam"`.

### Soluzione — inverti e confronta

```ts
function isPalindrome(s: string): boolean {
  return s === s.split('').reverse().join('');
}
// isPalindrome('racecar') → true
// isPalindrome('hello')   → false
```

**Cosa fa ogni step:**

```ts
'racecar'
  .split('') // ['r','a','c','e','c','a','r']  — stringa → array di caratteri
  .reverse() // ['r','a','c','e','c','a','r']  — inverte l'array sul posto
  .join(''); // 'racecar'                      — array → stringa
```

Ogni step è O(n) — tre passaggi, ma `3 × O(n) = O(n)` (le costanti si ignorano in Big O).

**Perché NON si usa Map?**

Map conta le frequenze. Un palindromo non riguarda le frequenze — riguarda l'ordine. `'abc'` e `'cba'` hanno le stesse frequenze ma non sono la stessa parola invertita.

### Cosa dire a voce alta

> "Implemento l'inversione con `split/reverse/join` — semplice e leggibile, O(n) tempo. Crea un array temporaneo in memoria, quindi O(n) spazio. Se il requisito fosse minimizzare la memoria, potrei usare due puntatori partendo dai lati e avanzando verso il centro — stessa complessità di tempo ma O(1) spazio — ma per la maggior parte dei casi pratici va benissimo così."

---

## 7. Live Coding: Ristorante (OOP)

### Di cosa si tratta

Modellare un sistema ristorante con delle classi. Di solito: `Restaurant`, `Table`, `Order`, `MenuItem`. Testa i concetti OOP: incapsulamento, relazioni tra classi.

### Sintassi TypeScript — le basi che ti servono qui

**Assegnare valori alla costruzione:**

```ts
// versione lunga — esplicita
class MenuItem {
  name: string;
  price: number;

  constructor(name: string, price: number) {
    this.name = name;
    this.price = price;
  }
}

// shortcut TypeScript — equivalente, scrive meno
class MenuItem {
  constructor(
    public name: string,
    public price: number
  ) {}
}

const pasta = new MenuItem('Pasta', 12.5); // name='Pasta', price=12.5
```

**Valori di default:**

```ts
// come proprietà della classe
class Order {
  private items: MenuItem[] = []; // default: array vuoto
  private discount = 0; // default: 0%
}

// oppure direttamente nel costruttore — stesso risultato
class Order {
  constructor(
    private discount: number = 0, // se non passi niente → 0
    private items: MenuItem[] = [] // se non passi niente → array vuoto
  ) {}
}

new Order(); // discount=0, items=[]
new Order(10); // discount=10, items=[]
```

**Metodo discount — e come Order ne è "conscia":**

`Order` tiene lo sconto come stato privato. `applyDiscount` è l'unico modo per cambiarlo, e `getTotal` lo legge da solo — non serve passarlo come parametro.

```ts
class Order {
  private items: MenuItem[] = [];
  private discount = 0;

  addItem(item: MenuItem): void {
    this.items.push(item);
  }

  applyDiscount(percent: number): void {
    this.discount = percent; // modifica il campo interno
  }

  getTotal(): number {
    const subtotale = this.items.reduce((sum, item) => sum + item.price, 0);
    return subtotale * (1 - this.discount / 100); // usa il campo interno
  }
}

// uso:
ordine.addItem(new MenuItem('Pasta', 12.5));
ordine.addItem(new MenuItem('Vino', 8.0));
ordine.getTotal(); // 20.5

ordine.applyDiscount(10); // discount = 10
ordine.getTotal(); // 18.45  ← getTotal legge this.discount automaticamente
```

---

### Modello minimo funzionante

```ts
class MenuItem {
  constructor(
    public name: string,
    public price: number
  ) {}
}

class Order {
  private items: MenuItem[] = [];

  addItem(item: MenuItem): void {
    this.items.push(item);
  }

  getTotal(): number {
    return this.items.reduce((sum, item) => sum + item.price, 0);
  }
}

class Table {
  private currentOrder: Order | null = null;

  constructor(public number: number) {}

  startOrder(): void {
    this.currentOrder = new Order();
  }
  getOrder(): Order | null {
    return this.currentOrder;
  }
}

class Restaurant {
  private tables: Table[] = [];

  addTable(table: Table): void {
    this.tables.push(table);
  }

  getTable(number: number): Table | undefined {
    return this.tables.find(t => t.number === number);
  }

  getTablesWithOrders(): Table[] {
    return this.tables.filter(t => t.getOrder() !== null);
  }
}
```

### Cosa dire a voce alta

> "Parto dal modello dei dati — quali sono le entità e le loro relazioni. MenuItem è un value object — solo dati. Order aggrega i MenuItem. Table possiede un Order. Restaurant possiede le Table. Ogni classe ha una sola responsabilità — è la S del SOLID."

### Demo d'uso — come si chiamano i metodi

```ts
const ristorante = new Restaurant();

// crea tavoli e aggiungili al ristorante
const tavolo1 = new Table(1);
const tavolo2 = new Table(2);
ristorante.addTable(tavolo1);
ristorante.addTable(tavolo2);

// tavolo 1 inizia un ordine
tavolo1.startOrder();
const ordine = tavolo1.getOrder()!; // Order | null → usiamo ! perché sappiamo che c'è

// aggiungi piatti all'ordine
const pasta = new MenuItem('Pasta', 12.5);
const vino = new MenuItem('Vino', 8.0);
ordine.addItem(pasta);
ordine.addItem(vino);

console.log(ordine.getTotal()); // 20.5

// tavolo 2 non ha ancora ordinato
console.log(ristorante.getTablesWithOrders().length); // 1 — solo tavolo1
```

La catena di responsabilità:

- `ristorante` sa solo di Tavoli — non tocca mai `Order` direttamente
- `tavolo` sa solo del suo Order — non tocca mai i MenuItem direttamente
- `ordine` gestisce i MenuItem e calcola il totale
- Ogni classe espone solo ciò che serve — questo è l'**incapsulamento**

### Possibili domande di follow-up

- "Aggiungi uno sconto" → `applyDiscount(percent: number): void { this.discount = percent; }` su Order, adatta `getTotal()`
- "Mostra tutti i tavoli con ordini attivi" → `getTablesWithOrders()` già sopra — `filter(t => t.getOrder() !== null)`
- "E se due tavoli condividono un ordine?" → spiega composizione vs riferimento condiviso

---

## 8. Live Coding: Esercizi su Array

### Esercizio 1 — Conta le occorrenze (`"dog cat cat cow cow cow"`)

```ts
// O(n) — Map dà O(1) di lookup per parola
function countOccurrences(words: string[]): Map<string, number> {
  const map = new Map<string, number>();
  for (const word of words) {
    map.set(word, (map.get(word) ?? 0) + 1);
  }
  return map;
}
// countOccurrences(['dog','cat','cat','cow','cow','cow'])
// → Map { dog→1, cat→2, cow→3 }
```

> "Map dà O(1) di lookup per parola, quindi tutto fa O(n) — una sola passata."

### Esercizio 2 — Controlla se l'array è ordinato

```ts
// O(n) — singola passata
function isSorted(arr: number[]): boolean {
  for (let i = 0; i < arr.length - 1; i++) {
    if (arr[i] > arr[i + 1]) return false;
  }
  return true;
}
```

### Esercizio 3 — Controllo anagramma (usa Map/HashMap)

```ts
// O(n) — Map per la frequenza dei caratteri
function isAnagram(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  const map = new Map<string, number>();
  for (const c of a) map.set(c, (map.get(c) ?? 0) + 1);
  for (const c of b) {
    const count = (map.get(c) ?? 0) - 1;
    if (count < 0) return false;
    map.set(c, count);
  }
  return true;
}
// isAnagram('listen', 'silent') → true
```

### Esercizio 4 — Parole senza lettere ripetute (`"la casa è bella"`)

```ts
// O(n * k) dove k = lunghezza media delle parole
function wordsWithUniqueLetters(sentence: string): string[] {
  return sentence.split(' ').filter(word => {
    const seen = new Set<string>();
    for (const c of word) {
      if (seen.has(c)) return false;
      seen.add(c);
    }
    return true;
  });
}
// 'la' → ✅  'casa' → ❌ ('a' ripetuta)  'bella' → ❌ ('l' ripetuta)
```

### Matrice identità

```ts
// O(n²) — bisogna visitare ogni cella, inevitabile
function isIdentityMatrix(matrix: number[][]): boolean {
  const n = matrix.length;
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      const expected = i === j ? 1 : 0;
      if (matrix[i][j] !== expected) return false;
    }
  }
  return true;
}
```

---

## 9. Stack, Queue e LinkedList

> Tre strutture dati che chiedono esplicitamente nel live coding. Ognuna è un concetto + un'implementazione da saper scrivere.

### La versione semplice — JS/TS ha già tutto

In JS non esiste una classe `Stack` o `Queue` built-in, ma un **array fa entrambe le cose** con metodi diversi:

```ts
// STACK — LIFO (pila di piatti)
const stack: number[] = [];
stack.push(1); // aggiungi in cima   → [1]
stack.push(2); // aggiungi in cima   → [1, 2]
stack.push(3); // aggiungi in cima   → [1, 2, 3]
stack.pop(); // togli dalla cima   → 3  (ultimo entrato, primo uscito)
stack.at(-1); // guarda senza togliere → 2

// QUEUE — FIFO (fila al supermercato)
const queue: number[] = [];
queue.push(1); // aggiungi in fondo  → [1]
queue.push(2); // aggiungi in fondo  → [1, 2]
queue.push(3); // aggiungi in fondo  → [1, 2, 3]
queue.shift(); // togli dalla testa  → 1  (primo entrato, primo uscito)
queue[0]; // guarda senza togliere → 2
```

La differenza è solo dove togli:

- Stack → `.pop()` toglie **dalla fine** (stesso lato dove inserisci)
- Queue → `.shift()` toglie **dall'inizio** (lato opposto a dove inserisci)

> ⚠️ `shift()` è O(n) — sposta tutti gli elementi dopo la rimozione. Per il live coding va bene, in produzione si usano strutture più efficienti.

### La versione con classe — da scrivere al colloquio se chiedono esplicitamente

> "L'ultimo elemento inserito è il primo a uscire. Come una pila di piatti — togli sempre quello in cima."

Operazioni: `push` (aggiungi in cima), `pop` (rimuovi dalla cima), `peek` (guarda senza rimuovere).

```ts
class Stack<T> {
  private items: T[] = [];

  push(item: T): void {
    this.items.push(item);
  }
  pop(): T | undefined {
    return this.items.pop();
  }
  peek(): T | undefined {
    return this.items[this.items.length - 1];
  }
  isEmpty(): boolean {
    return this.items.length === 0;
  }
}

const stack = new Stack<number>();
stack.push(1);
stack.push(2);
stack.push(3);
stack.pop(); // → 3  (ultimo entrato, primo uscito)
stack.peek(); // → 2  (in cima, senza rimuovere)
```

> Con un semplice array: `push()` aggiunge in fondo, `pop()` toglie da fondo — già LIFO.

### Queue (Coda) — FIFO: First In, First Out

> "Il primo elemento inserito è il primo a uscire. Come una fila al supermercato — si serve chi è arrivato prima."

Operazioni: `enqueue` (aggiungi in fondo), `dequeue` (rimuovi dalla testa).

```ts
class Queue<T> {
  private items: T[] = [];

  enqueue(item: T): void {
    this.items.push(item);
  }
  dequeue(): T | undefined {
    return this.items.shift();
  }
  front(): T | undefined {
    return this.items[0];
  }
  isEmpty(): boolean {
    return this.items.length === 0;
  }
}

const queue = new Queue<number>();
queue.enqueue(1);
queue.enqueue(2);
queue.enqueue(3);
queue.dequeue(); // → 1  (primo entrato, primo uscito)
queue.front(); // → 2  (prossimo in uscita)
```

> ⚠️ `shift()` è O(n) perché sposta tutti gli elementi — per performance real-world si usa una LinkedList o un puntatore di testa. Per il live coding è accettabile.

### LinkedList — Lista concatenata

> "Sequenza di nodi dove ognuno punta al successivo. Non c'è indice — per trovare un elemento devi scorrere dalla testa."

```ts
class Node<T> {
  constructor(
    public value: T,
    public next: Node<T> | null = null
  ) {}
}

class LinkedList<T> {
  private head: Node<T> | null = null;

  append(value: T): void {
    const node = new Node(value);
    if (!this.head) {
      this.head = node;
      return;
    }
    let current = this.head;
    while (current.next) current = current.next;
    current.next = node;
  }

  toArray(): T[] {
    const result: T[] = [];
    let current = this.head;
    while (current) {
      result.push(current.value);
      current = current.next;
    }
    return result;
  }
}

const list = new LinkedList<number>();
list.append(1);
list.append(2);
list.append(3);
list.toArray(); // → [1, 2, 3]
```

### Confronto rapido

| Struttura  | Ordine uscita | Accesso per indice | Dove si usa                                     |
| ---------- | ------------- | ------------------ | ----------------------------------------------- |
| Stack      | LIFO (ultimo) | ❌                 | Undo/redo, call stack, navigazione              |
| Queue      | FIFO (primo)  | ❌                 | Gestione ordini, job queue, BFS                 |
| LinkedList | Sequenziale   | ❌ O(n)            | Implementazione di Stack/Queue, liste dinamiche |
| Array      | Qualsiasi     | ✅ O(1)            | Accesso casuale, indici                         |

---

## ⚡ Cheatsheet dell'ultimo minuto

**Regole del live coding (dal loro doc):**

1. Ragiona sempre ad alta voce — di' la complessità prima di scrivere il codice
2. Ciclo singolo dove possibile — O(n) è l'obiettivo
3. HashMap è l'arma magica — porta da O(n²) a O(n)
4. Occhi sul monitor — non guardare altrove

**Se vai in bianco:** di' _"Fammi ragionare prima sulla struttura dati"_ poi nomina input, output e complessità che vuoi ottenere. Guadagni tempo e dimostri metodo.

---

## 10. Database Relazionali vs Non-relazionali

> "I database relazionali usano **tabelle con schema fisso**, relazioni via chiavi esterne, e garantiscono **ACID**. Standard per dati finanziari e transazionali: PostgreSQL, Oracle, SQL Server.
>
> I NoSQL scambiano schema rigido per flessibilità e scaling orizzontale. Tradeoff: consistenza eventuale, niente join. Tipi principali: Document (MongoDB), Key-Value (Redis), Wide Column (Cassandra), Graph (Neo4j)."

---

## 11. Domande Junior/Senior in TypeScript/Angular

> Questi sono gli equivalenti Angular/TypeScript della lista di domande junior/senior Java. Rispondile con la stessa naturalezza.

### Domande di livello junior

**1. Differenza tra libreria e framework**

> "Una libreria è codice che chiami tu — sei tu a controllare. Un framework chiama te — controlla il flusso e tu riempi gli spazi. Angular è un framework completo: controlla il bootstrap, il ciclo di vita, la DI, il routing. RxJS è una libreria — la chiami quando ne hai bisogno."

**2. Cos'è il Garbage Collector in JavaScript**

> "JavaScript libera automaticamente la memoria che non è più raggiungibile. Non fai `free()` manualmente. Il motore usa mark-and-sweep — segna tutto ciò che è raggiungibile dalla radice (window, global), poi pulisce il resto. L'errore comune in Angular: subscription che mantengono un riferimento vivo impedendo al GC di liberare il componente — ecco perché esiste `takeUntilDestroyed()`."

Come funziona in dettaglio:

Il motore JS ha due zone di memoria — lo **Stack** (variabili primitive e riferimenti locali, si svuota da solo quando la funzione termina) e lo **Heap** (oggetti, array, funzioni — il GC decide quando liberarli).

L'algoritmo **mark-and-sweep** funziona così:

1. Parte dalla radice (`window` / global scope)
2. Segue tutti i riferimenti raggiungibili — li "marca"
3. Tutto ciò che NON è marcato = irraggiungibile = liberato dal GC

```ts
let user = { name: 'Alice' }; // oggetto in heap, user lo punta

user = null; // nessuno punta più all'oggetto
// → GC lo vede irraggiungibile → lo libera
```

**Il memory leak con RxJS — cosa succede concretamente:**

```ts
@Component({ ... })
export class ProductListComponent implements OnInit {
  ngOnInit() {
    this.productService.getProducts().subscribe(products => {
      this.products = products;  // callback tiene un riferimento a 'this'
    });
  }
}
```

Quando navighi via dalla pagina, Angular distrugge il componente dal DOM. Ma la subscription è ancora viva nell'Observable — che tiene un riferimento al componente (per aggiornare `this.products`):

```
Observable → subscription → callback → this → intero componente in heap
```

Il GC vede che il componente è ancora raggiungibile → non lo libera. Se navighi avanti e indietro 10 volte, hai 10 componenti "zombie" in memoria.

**La soluzione — `takeUntilDestroyed()`:**

```ts
@Component({ ... })
export class ProductListComponent implements OnInit {
  private destroyRef = inject(DestroyRef);

  ngOnInit() {
    this.productService.getProducts()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(products => { this.products = products; });
  }
}
```

Quando il componente viene distrutto → `takeUntilDestroyed` completa l'Observable → la subscription si chiude → il riferimento al componente sparisce → GC lo libera.

> **Analogia:** la subscription è un contratto d'affitto che continua a pagare anche dopo che sei andato via. L'appartamento (componente) non può essere demolito (liberato) finché c'è un contratto attivo. `takeUntilDestroyed` è la disdetta al momento del trasloco.

**3. Primitivi vs oggetti in TypeScript**

> "Primitivi: `string`, `number`, `boolean`, `null`, `undefined`, `symbol`, `bigint` — memorizzati per valore, immutabili. Oggetti (array, funzioni, istanze di classi): memorizzati per riferimento — una variabile tiene un puntatore all'oggetto, non l'oggetto stesso. Per questo `===` su due oggetti con stesso contenuto dà `false` — sono riferimenti diversi. Il change detection di OnPush si basa sull'uguaglianza di riferimento — se muti un oggetto invece di sostituirlo, Angular non rileva il cambiamento."

**4. Cos'è un'interfaccia**

> "Un'interfaccia in TypeScript definisce la forma di un oggetto — il contratto che deve soddisfare. È puramente compile-time, zero costo a runtime. Una classe `implements` un'interfaccia. È il modo per garantire che un servizio o un modello abbia le proprietà e i metodi attesi. In Angular, le interfacce definiscono i Modelli (`User`, `Product`) e i contratti dei servizi."

**5. Iniezione delle dipendenze**

> "DI è un pattern in cui una classe dichiara di cosa ha bisogno e qualcos'altro glielo fornisce — non chiami `new SomeService()` tu stesso. In Angular, `inject(AuthService)` chiede al container DI per l'istanza. Il beneficio: puoi sostituire le implementazioni nei test, e Angular gestisce il ciclo di vita. È la D del SOLID — Dependency Inversion."

**6. Cos'è l'incapsulamento**

> "L'incapsulamento significa che una classe possiede il suo stato e controlla l'accesso ad esso. In TypeScript: i campi `private` non possono essere toccati dall'esterno. Nel SignalStore di Angular: il segnale scrivibile è privato dentro lo store, esposto in sola lettura ai consumatori — i componenti possono leggere lo stato ma non possono aggirare la logica di aggiornamento dello store."

**7. Overload e override**

> "Override: una sottoclasse ridefinisce un metodo dal padre — stesso nome, stessa firma, implementazione diversa. TypeScript usa la parola chiave `override`. Overload: più firme per la stessa funzione che accettano diversi tipi di parametri — TypeScript risolve a compile-time quale firma usare. In Angular raramente scrivi ereditarietà di classi, ma fai override dei lifecycle hook come `ngOnInit` da una classe base."

**8. Come si testa il codice**

> "Tre livelli. Unit test: testa una singola funzione o classe in isolamento — Jest in questo progetto, si mockano le dipendenze. Integration test: testa come i pezzi funzionano insieme — es. un componente + il suo servizio. E2E test: testa l'intera app in un browser reale — Playwright. La piramide dei test dice: tanti unit test, meno integration, pochi E2E. La coverage viene misurata da Istanbul — `nx run admin-dashboard:test --coverage` genera un report HTML."

**9. Modificatore `readonly` / `const`**

> "`const` a livello variabile — non puoi riassegnare il binding, ma puoi mutare l'oggetto. `readonly` su una proprietà di classe — si può impostare solo nel costruttore. `as const` su un oggetto letterale — rende privata ogni proprietà annidata a livello di tipo. Per i segnali: esponi `signal.asReadonly()` così i consumatori non possono chiamare `.set()` su di esso."

**10. Come funziona il metodo Sort**

> "`Array.sort()` ordina in-place. Di default converte gli elementi in stringhe e ordina lessicograficamente — `[10, 9, 2].sort()` dà `[10, 2, 9]` che è sbagliato per i numeri. Passa sempre un comparatore per i numeri: `arr.sort((a, b) => a - b)`. Complessità: O(n log n) — V8 usa TimSort. Attenzione: muta l'array originale — usa `[...arr].sort()` per mantenere l'originale."

```ts
// Sbagliato (default — lessicografico)
[10, 9, 2]
  .sort() // [10, 2, 9] ❌

  [
    // Corretto (comparatore numerico)
    (10, 9, 2)
  ].sort((a, b) => a - b); // [2, 9, 10] ✅

// Sort immutabile (non mutare l'originale)
const sorted = [...original].sort((a, b) => a - b);
```

**11. `==` vs `===` — qual è la differenza?**

> "`===` è uguaglianza stretta: confronta tipo E valore. `==` fa type coercion prima di confrontare — JavaScript converte automaticamente i tipi, il che porta a risultati controintuitivi. In TypeScript e in Angular si usa sempre `===`. Mai `==`."

```ts
// == con coercione (evitare)
1 == '1'; // true  — stringa convertita a numero
null == undefined; // true  — regola speciale
0 == false; // true  — false → 0

// === stretta (usare sempre)
1 === '1'; // false — tipo diverso
null === undefined; // false
0 === false; // false

// Caso trappola con oggetti (sia == che ===)
const a = { x: 1 };
const b = { x: 1 };
a === b; // false — confronta RIFERIMENTI, non contenuto
a == b; // false — stesso motivo
```

> "Per confrontare oggetti per valore, devi scrivere la logica tu — oppure usare `JSON.stringify` per strutture semplici, o una libreria come Lodash `isEqual`. Angular `OnPush` sfrutta questa stessa semantica: confronta il riferimento all'input, non il contenuto."

---

### Domande di livello senior

**1. Cosa significa "senior" per te**

> Già nel Tier 6 — Sezione 9. Sei responsabile degli outcome, non dei task. Rendi le persone intorno a te più veloci.

**2. Come gestisci le risorse junior**

> Già nel Tier 6 — Sezione 12. Guidali verso la risposta, non dartela tu. Imposta un time-box prima di chiedere aiuto.

**3. Change Detection — come funziona in Angular**

> "La strategia Default controlla ogni componente ad ogni evento asincrono. OnPush controlla solo quando un segnale cambia, un riferimento di input cambia, o un async pipe emette. Zoneless (quello che usa questo progetto) rimuove Zone.js completamente — solo le letture dei segnali guidano gli aggiornamenti. Niente polling, niente controlli sull'intero albero."

**4. Dependency Injection tree — scope avanzato**

> "Angular ha una gerarchia di injector: root → platform → component. `providedIn: 'root'` = una sola istanza per tutta l'app. Aggiungere un servizio ai `providers: []` di un componente crea una nuova istanza isolata per quel sottoalbero di componenti. È l'equivalente dello scope Prototype — ed è il bug che abbiamo in `profile.component.ts` con `AuthStore`."

**5. RxJS memory leak — come lo previeni**

> "Un Observable non si auto-completa — la subscription rimane viva finché il componente esiste o oltre. Se il componente viene distrutto senza unsubscribe, il callback continua a girare. Soluzione: `takeUntilDestroyed()` operator nel costruttore — si aggancia automaticamente al lifecycle del componente. Oppure `async pipe` nel template che gestisce subscribe/unsubscribe automaticamente."

**6. Cosa faresti scoprendo un bug in produzione alle 2 di notte**

> "Prima valuto l'impatto — quanti utenti, è un dato critico, c'è un workaround? Se è bloccante, sveglio il team. Poi guardo i log (Sentry, CloudWatch) per trovare lo stack trace. Se ho una fix rapida la faccio, altrimenti feature flag off per il componente rotto. Post-mortem il giorno dopo — non per trovare colpevoli ma per capire il gap nel processo (test, monitoring, staging)."
