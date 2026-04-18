## TECNOLOGIE UTILIZZATE

## • Java 2 Enterprise Edition (J2EE)

## • Spring

## • Springboot

## • Microservizi

## • DB Relazionali

- Oracle
- SQL Server
- Postgres

## • Metodologia Agile e Scrum

## DETTAGLI PROGETTO

## • Prodotto Finanziario (Tagetik)

- Bilancio consolidato

## • Full Remote

- 1 o 2 trasferte l’annodi 1 settimana

##### (Lun –Ven)presso la sede di

##### LUCCA

## • Gruppi di lavoro da 6 persone

- 2 Senior
- 4 Junior

# Progetto Wolters Kluwer

### Strutture Dati in Finanza

**Spiegazione della Struttura**

Un **array** è una collezione **contigua** di elementi dello stesso
tipo, accessibili tramite un indice.

- **Dimensione fissa** (in alcuni linguaggi) o dinamica.
- Esempio:[10.5, 11.2, 12.8, ...](prezzi di un’azione).

**Costo Computazionale**

- Accesso a un elemento: **O(1)** (per indice).
- Ricerca di un valore: **O(n)** (se non ordinato).
- Inserimento/Cancellazione: **O(n)** (deve shiftare gli
  elementi).

**Applicazioni in Finanza**

- Memorizzare **serie storiche** (prezzi, volumi).
- Calcolare **medie mobili** e indicatori tecnici.

#### 1. Array (Vettori) 2. Hash Table (Dizionari)

**Spiegazione della Struttura**

```
Una hash table mappa chiavi → valori usando una funzione
di hash per ottenere accesso rapido.
```

- Esempio:{"AAPL": 175.30, "MSFT": 310.20}.

**Costo Computazionale**

- Inserimento/Ricerca/Cancellazione: **O(1)** (caso
  medio), **O(n)** (caso peggiore per collisioni).

**Applicazioni in Finanza**

- **Database di asset** (ticker → prezzo).
- **Memorizzazione di parametri finanziari** (P/E,
  dividend yield).

### Strutture Dati in Finanza

**Spiegazione della Struttura**

Un **albero binario** organizza dati in nodi con **due figli
(sinistro/destro)**.

- **BST (Binary Search Tree)** : Non bilanciato, può
  degenerare in una lista ( **O(n)** nel caso peggiore).
- **AVL/Red-Black Tree** : Auto-bilanciati,
  garantiscono **O(log n)**.

**Costo Computazionale**

- Ricerca/Inserimento/Cancellazione: **O(log n)** (se
  bilanciato).

**Applicazioni in Finanza**

- **Order Book** (gestione degli ordini bid/ask ordinati
  per prezzo).
- **Pricing di opzioni** (alberi binomiali).

#### 3. Alberi Binari di Ricerca (BST, AVL,

#### Red-Black Tree)

#### 4. Heap (Min-Heap / Max-Heap)

**Spiegazione della Struttura**

```
Uno heap è un albero binario completo dove ogni nodo è
maggiore (max-heap) o minore (min-heap) dei suoi figli.
```

- Usato per **priority queue**.

**Costo Computazionale**

- Inserimento/Cancellazione: **O(log n)**.
- Accesso al max/min: **O(1)**.

**Applicazioni in Finanza**

- **Esecuzione di ordini** (Price-Time Priority).
- **Algoritmi di scheduling** nel trading algoritmico.

### Strutture Dati in Finanza

**Spiegazione della Struttura**

Un **grafo** è una struttura composta da **nodi (vertici)** e **archi
(connessioni)**.

- **Grafo diretto** : Gli archi hanno una direzione (es.
  transazioni finanziarie).
- **Grafo non diretto** : Gli archi sono bidirezionali (es.
  correlazioni tra asset).

**Costo Computazionale**

- Ricerca (DFS/BFS): **O(V + E)**.
- Cammino minimo (Dijkstra): **O((V + E) log V)**.

**Applicazioni in Finanza**

- **Analisi delle correlazioni** tra asset.
- **Modelli di rischio sistemico** (es. fallimenti a
  catena).

#### 5. Grafi 6. Code (FIFO, LIFO, Priority Queue)

**Spiegazione della Struttura**

- **FIFO (First-In-First-Out)** : Come una coda al
  supermercato.
- **LIFO (Last-In-First-Out)** : Come uno stack di piatti.
- **Priority Queue** : Gli elementi escono in base a una
  priorità (es. prezzo).

**Costo Computazionale**

- Inserimento/Cancellazione: **O(1)** per
  FIFO/LIFO, **O(log n)** per Priority Queue.

**Applicazioni in Finanza**

- **Gestione degli ordini** in un exchange (FIFO).
- **Backtesting** (LIFO per simulare esecuzioni).

### Strutture Dati in Finanza

**Spiegazione della Struttura**

Un **trie** è un albero per memorizzare stringhe in modo
efficiente.

- Ogni nodo rappresenta un carattere (es. "A" → "P" →
  "P" → "L" per "AAPL").

**Costo Computazionale**

- Ricerca/Inserimento: **O(k)** (dove **k** è la lunghezza
  della chiave).

**Applicazioni in Finanza**

- **Ricerca rapida di ticker** (es. terminali Bloomberg).
- **Filtraggio di simboli** in database finanziari.

#### 7. Trie (Radix Tree) 8. DataFrame (Pandas)

**Spiegazione della Struttura**

```
Un DataFrame è una tabella con righe e colonne , simile a un
foglio Excel.
```

- Può essere indicizzato per tempo (serie storiche).

**Costo Computazionale**

- Operazioni vettorializzate: **O(n)**.
- Ricerca/Join: **O(n log n)**.

**Applicazioni in Finanza**

- **Analisi di portafogli**.
- **Backtesting di strategie**.

### Strutture Dati in Finanza

**Spiegazione della Struttura**

Database ottimizzati per **dati temporali** (es. prezzi storici).

- Esempi: InfluxDB, TimescaleDB.

**Costo Computazionale**

- Ricerca/Inserimento: **O(k)** (dove **k** è la lunghezza
  della chiave).

**Applicazioni in Finanza**

- **Ricerca rapida di ticker** (es. terminali Bloomberg).
- **Filtraggio di simboli** in database finanziari.

#### 9. Time-Series Database (TSDB) 10. Bloom Filter

**Spiegazione della Struttura**

```
Struttura probabilistica per verificare se un elemento è in un
insieme.
```

- Può dare **falsi positivi** , ma mai falsi negativi.

**Costo Computazionale**

- Inserimento/Ricerca: **O(k)** (dove **k** è il numero di
  funzioni hash).

**Applicazioni in Finanza**

- **Filtraggio rapido di asset** (es. "Questo titolo è nel
  mio universo investibile?").

### Strutture Dati in Finanza

```
Struttura Dati Accesso Inserimento Cancellazione Applicazione Principale
Array O(1) O(n) O(n) Serie storiche
Hash Table O(1) O(1) O(1) Mappatura ticker → prezzo
Red-Black Tree O(log n) O(log n) O(log n) Order book
Heap O(1) (min/max) O(log n) O(log n) Esecuzione ordini
Grafo O(V + E) O(1) (per arco) O(E) Analisi di correlazione
```

#### Confronto tra Strutture Dati in Finanza

**Considerazioni Finali**

- **Trading ad Alta Frequenza (HFT)** : Si usano **hash table** e **alberi bilanciati** per minimizzare la latenza.
- **Big Data Finanziari** : **DataFrame** e **TSDB** sono essenziali per gestire milioni di record.
- **Ricerca Rapida** : **Trie** e **Bloom Filter** ottimizzano le query su grandi dataset.
- Ogni struttura ha **trade-off** tra velocità, memoria e complessità. La scelta dipende dall’uso specifico

(es. real-time trading vs. analisi storica).

## Argomenti colloquio Java Senior

#### 1. Spring

###### A. Scope

```
I. Singleton
II. Prototype
```

###### B. Versioning

###### C. Spring AI

#### 2. Springboot

###### A. Secret Manager

#### 3. Principi del SOLID

#### 4. Design Pattern

###### A. Singleton

###### B. Prototype

#### 5. Intelligenza Artificiale

###### A. Solo come supporto

#### 6. JWT (JSON Web Token)

###### A. Authentication

###### B. Authorization

#### 7. Object-relational mapping (ORM)

#### 8. Kafka

###### A. Consumer Groups

#### 9. Gestione Risorse Junior

###### A. Test sul codice

###### B. Capacità di insegnamento

### Piramide dei Test

## Domande colloquio Java Junior

1. Qual è la differenza tra **libreria** e **framework**
2. Come funziona la **locazione di memoria**
3. Cos’è il **Garbage Collector (GC)** in Java
4. Cosa sono le **interfacce** e cosa fanno
5. Conosci gli **algoritmi**
6. Provare a spiegare cos’è **Springboot** a una
   persona che non sa che cosa sia
7. Spiegare il concetto di **incapsulamento**
8. Spiegare gli **allocamenti di memoria**
9. Spiegare la **reference** degli oggetti
10. Distinzione tra **primitivo** e oggetto
11. Differenze tra **Spring** e **Springboot** 12. Dove risiedono gli oggetti in Java 13. Cos’è una classe **astratta** 14. Cosa sono **l’overload** e **l’override** 15. Parlami delle metodologie **Agile** e **Scrum** 16. Cosa sono i **Design Patterns** 17. Come si testa il codice in Java 18. Cos’è un **ORM** 19. Modificatore "final" nelle classi e negli
    attributi 20. Come funziona il **metodo Sort** 21. Iniezione delle dipendenze

## Live Coding colloquio Java

##### L’ AUTOCOMPLETE verrà DISABILITATO

##### NON si potranno richiamare Metodi o accedere a Librerie.

**_N.B._** _se il candidato conosce il nome della classe ma si dimentica il metodo può chiedere un_ **_aiuto_**

1. Seguire tutte le logiche di **complessità computazionale:**

```
I. Algoritmo efficiente in termini di risorse utilizzate (tempo di esecuzione, memoria ecc...)
II. Dare sempre una soluzione ottimizzata.
III. Dove possibile utilizzare un solo ciclo.
```

2. **Ragionare** sempre a voce alta per coinvolgere i referenti.
3. Tenere sempre lo **sguardo sul monitor** (No doppio monitor)

###### Regole da seguire

Il candidato si collegherà ad un **IDE online** (es. **JDoodle** , **OnlineJDB** ) e condividerà lo schermo

## Live Coding colloquio Java

1. Array 1: 123456. Array 2: 264153. Dimostrare se l’array è ordinato oppure no
2. Array: «dog cat cat cow cow cow». Ricavare il numero di occorrenze per ogni elemento
3. Ricreare ex-novo a livello logico una **LinkedList** (rami e foglie)
4. Ricreare ex-novo a livello logico lo **Stack/Pila**
5. Esercizi su **Classi nidificate**
6. «la casa è bella». Individuare le parole che non contengono lettere uguali.
7. Creare in Java una classe **Arraystack** con un vettore di 3 elementi contenente oggetti di una classe chiamata
   «punto» precedentemente creata
8. Implementare una classe generica (CODA)
9. Fare una classe di nome «employed» che abbia come unico attributo un’intero e fornire un’implementazione
   delle classi «manager» ed «employed administrator»
10. Implementare un albero **n-ario**
11. Creare una classe **String Wrapper** che abbia un attributo stringa
12. Verificare se 2 stringhe sono una l’ **anagramma** dell’altra. (Utilizzare una **HashMap** )
13. Capire se una matrice è identità o no

###### Esempi di Test

**ANAGRAMMA**
