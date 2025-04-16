# Hockey Prediction App

Webová aplikace "Tipovačka MS v Hokeji 2025" - komplexní aplikace pro predikci výsledků hokejových zápasů, správu soukromých lig a automatické vyhodnocování tipů.

## Funkce

- Uživatelská autentizace (registrace, přihlášení)
- Vytváření a správa soukromých lig
- Predikce výsledků zápasů (základní skupiny i play-off)
- Automatické generování tabulek a pavouka play-off
- Automatické vyhodnocování tipů a bodování
- Žebříčky uživatelů v rámci lig
- Administrátorský panel pro správu zápasů a výsledků
- Integrace s TheSportsDB API pro získávání výsledků
- Responzivní design pro mobilní i desktopová zařízení

## Technologie

### Backend
- Node.js
- Express
- MongoDB
- JWT pro autentizaci
- Axios pro API požadavky

### Frontend
- React
- React Router
- React Bootstrap
- Axios
- Formik a Yup pro validaci formulářů

## Instalace a spuštění

### Požadavky
- Node.js (v14+)
- MongoDB
- Git

### Instalace

1. Klonování repozitáře
```
git clone https://github.com/username/hockey-prediction-app.git
cd hockey-prediction-app
```

2. Instalace závislostí
```
# Instalace backend závislostí
cd backend
npm install

# Instalace frontend závislostí
cd ../frontend
npm install
```

3. Konfigurace
```
# V adresáři backend vytvořte soubor .env podle vzoru .env.example
cp .env.example .env
# Upravte hodnoty v souboru .env podle vašeho prostředí
```

4. Spuštění vývojového serveru
```
# Spuštění backend serveru
cd backend
npm run dev

# Spuštění frontend serveru (v novém terminálu)
cd frontend
npm start
```

## Nasazení

Podrobný návod pro nasazení aplikace na produkční server najdete v souboru [DEPLOYMENT.md](DEPLOYMENT.md).

## Licence

Tento projekt je licencován pod MIT licencí - viz soubor [LICENSE](LICENSE) pro více informací.
