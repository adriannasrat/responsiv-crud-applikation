# Bokrum

Bokrum är en responsiv CRUD-applikation där varje användare kan hantera sina egna böcker och favoritcitat.

- **Frontend:** Angular 20
- **Backend:** .NET 9 Web API
- **Databas:** SQLite
- **Design:** Bootstrap och Font Awesome
- **Inloggning:** JWT-token

## Starta projektet

Du behöver Node.js 22 LTS och .NET 9 SDK.

Öppna projektmappen i två terminaler.

### 1. Starta API:et

```bash
npm run api
```

API:et körs på `http://127.0.0.1:5090`.

### 2. Starta Angular

```bash
npm start
```

Öppna sedan [http://127.0.0.1:4200](http://127.0.0.1:4200).

Om paketen inte är installerade kör du först:

```bash
npm install
dotnet restore backend/Books.Api
```

## Vad kan användaren göra?

1. Registrera ett konto.
2. Logga in med sitt användarnamn och lösenord.
3. Lägga till, redigera och radera böcker.
4. Lägga till, redigera och radera citat.
5. Växla mellan bok- och citatsidan med menyn.
6. Växla mellan ljust och mörkt tema.
7. Logga ut.

Varje användare ser bara sina egna böcker och citat.

## Projektets viktigaste filer

```text
src/
  app/
    core/          API-anrop, inloggning och modeller
    pages/         Sidor för konto, böcker, citat och formulär
    app.routes.ts  Adresserna till Angular-sidorna
  styles.css       Appens design och responsiva regler

backend/Books.Api/
  Controllers/     Endpoints för konto, böcker och citat
  Data/            SQLite och AppDbContext
  Dtos/            Data som skickas mellan Angular och API:et
  Models/          Databasmodeller
  Services/        Lösenordshantering och JWT
  Program.cs       Startar och konfigurerar API:et
  appsettings.json Grundinställningar
```

Filerna i `dist`, `node_modules`, `bin`, `obj` och `App_Data` skapas automatiskt. De ska normalt inte läggas till i Git.

## Databasen

SQLite-databasen skapas automatiskt här första gången API:et startas:

```text
backend/Books.Api/App_Data/bokrum.db
```

Konton, böcker och citat finns kvar när sidan eller API:et startas om. Radera inte databasfilen om du vill behålla innehållet.

Vid publicering kan miljövariabeln `DataDirectory` användas för att välja en beständig mapp för SQLite-databasen.

## Inloggning och säkerhet

- Lösenord sparas som hash, aldrig som vanlig text.
- API:et skapar en JWT efter en lyckad inloggning.
- JWT-tokenen sparas i webbläsarens `localStorage`.
- Angular skickar tokenen som en `Bearer`-token vid API-anrop.
- API:et validerar tokenen innan användaren får använda CRUD-endpoints.
- Utloggning tar bort tokenen från webbläsaren.
- Inloggning och registrering har ett enkelt skydd mot många snabba försök.

## Bygga projektet

```bash
npm run build
dotnet build backend/Books.Api
```
