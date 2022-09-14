Библиотека хранится в папке `$DATA/com.snorkysnark.moon-quote/library`,
где `$DATA` - `$HOME/.local/share` или `%AppData%\Roaming`, в зависимости от ОС.

Там находится база sqlite и папки, соответствующие id каждой книги.
В папках хранится epub и обложка, тогда как в базе - метаданные из epub (поля `meta_*`) и аннотации.

Метаданные и обложку лучше извлекать заранее, т.к. загрузка epub-файла занимает довольно много времени.
```
├── 1
│   ├── cover.jpg
│   └── Iskusstvo statistiki - Devid Shpighiel'khaltier.epub
├── 2
│   ├── cover.jpeg
│   └── Nordic Ideology_ A Metamodern Guide to Pol - Hanzi Freinacht.epub
├── 3
│   ├── cover.jpeg
│   └── The Listening Society_ A Metamodern Guide - Hanzi Freinacht.epub
├── 4
│   ├── cover.jpg
│   └── Uolles_Beskonechnaya-shutka.535958.fb2.epub
├── 5
│   ├── cover.jpg
│   └── Tutuola_Zakoldovannye-lesa_2_Moya-zhizn-v-lesu-duhov.97183.fb2.epub
├── 6
│   ├── cover.jpg
│   └── Gesse_Igra-v-biser-Puteshestvie-k-zemle-Vostoka.494626.fb2.epub
└── metadata.db
```

```sql
CREATE TABLE books (
    book_id INTEGER NOT NULL PRIMARY KEY,
    epub_file text NOT NULL,
    cover_file text,
    meta_title text,
    meta_creator text,
    meta_description text,
    meta_pubdate text,
    meta_publisher text,
    meta_identifier text,
    meta_language text,
    meta_rights text,
    meta_modified_date text,
    meta_layout text,
    meta_orientation text,
    meta_flow text,
    meta_viewport text,
    meta_spread text
);
```

```sql
CREATE TABLE annotations (
    annotation_id INTEGER NOT NULL PRIMARY KEY,
    book_id INTEGER NOT NULL,
    cfi text NOT NULL,
    text_content text NOT NULL,
    color INTEGER NOT NULL,

    UNIQUE (book_id, cfi),

    FOREIGN KEY (book_id) REFERENCES books (book_id)
        ON DELETE CASCADE
);
```
