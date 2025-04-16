# Podrobný návod pro nasazení aplikace Hockey Prediction App

Tento dokument obsahuje podrobný návod pro nasazení aplikace "Tipovačka MS v Hokeji 2025" na váš server. Návod je určen pro nasazení na server s operačním systémem Ubuntu 22.04, který jste již připravili.

## Obsah
1. [Přehled infrastruktury](#přehled-infrastruktury)
2. [Příprava serveru](#příprava-serveru)
3. [Nasazení aplikace](#nasazení-aplikace)
4. [Konfigurace aplikace](#konfigurace-aplikace)
5. [Spuštění aplikace](#spuštění-aplikace)
6. [Údržba a aktualizace](#údržba-a-aktualizace)
7. [Řešení problémů](#řešení-problémů)

## Přehled infrastruktury

Vaše infrastruktura se skládá z následujících komponent:

- **Server**: DigitalOcean Droplet s Ubuntu 22.04
  - IP adresa: 64.226.92.83
  - Přístupové údaje: uživatel `root`, heslo `FensterF3!2CiBuLe`
- **Doména**: malinon.cyou
  - DNS záznam typu 'A' směřující na IP adresu serveru

Aplikace se skládá z těchto hlavních částí:
- **Backend**: Node.js s Express, MongoDB
- **Frontend**: React.js
- **Webový server**: Nginx s SSL certifikátem Let's Encrypt

## Příprava serveru

### 1. Připojení k serveru

Připojte se k serveru pomocí SSH. Na Windows můžete použít PuTTY, na macOS nebo Linux použijte terminál:

```bash
ssh root@64.226.92.83
```

Zadejte heslo: `FensterF3!2CiBuLe`

### 2. Vytvoření GitHub repozitáře

1. Přejděte na [GitHub](https://github.com) a přihlaste se ke svému účtu
2. Klikněte na tlačítko "New" pro vytvoření nového repozitáře
3. Zadejte název repozitáře, např. "hockey-prediction-app"
4. Zvolte "Private" pro soukromý repozitář
5. Klikněte na "Create repository"

### 3. Nahrání kódu do GitHub repozitáře

Na vašem lokálním počítači (ne na serveru):

1. Naklonujte prázdný repozitář:
```bash
git clone https://github.com/VASE_UZIVATELSKE_JMENO/hockey-prediction-app.git
cd hockey-prediction-app
```

2. Zkopírujte všechny soubory aplikace do tohoto adresáře

3. Nahrajte soubory do repozitáře:
```bash
git add .
git commit -m "Initial commit"
git push origin master
```

### 4. Instalace základních balíčků na serveru

Na serveru spusťte:

```bash
apt update
apt upgrade -y
apt install -y git curl
```

### 5. Stažení repozitáře na server

```bash
mkdir -p /var/www
cd /var/www
git clone https://github.com/VASE_UZIVATELSKE_JMENO/hockey-prediction-app.git
cd hockey-prediction-app
```

Budete vyzváni k zadání vašeho GitHub uživatelského jména a hesla nebo osobního přístupového tokenu.

### 6. Spuštění instalačního skriptu

```bash
cd /var/www/hockey-prediction-app
chmod +x deployment/setup-server.sh
./deployment/setup-server.sh
```

Tento skript provede následující operace:
- Aktualizace systémových balíčků
- Instalace Node.js, MongoDB, Nginx a dalších závislostí
- Konfigurace Nginx pro vaši doménu
- Nastavení SSL certifikátu pomocí Let's Encrypt

## Nasazení aplikace

### 1. Nasazení kódu aplikace

```bash
cd /var/www/hockey-prediction-app
chmod +x deployment/deploy-app.sh
./deployment/deploy-app.sh
```

Tento skript provede:
- Instalaci závislostí pro backend i frontend
- Sestavení (build) frontendu
- Konfiguraci PM2 pro správu Node.js procesu

### 2. Nastavení databáze

```bash
cd /var/www/hockey-prediction-app
chmod +x deployment/setup-database.sh
./deployment/setup-database.sh
```

Tento skript vytvoří databázi a administrátorského uživatele s těmito přihlašovacími údaji:
- Email: admin@example.com
- Heslo: admin123

**DŮLEŽITÉ**: Po prvním přihlášení okamžitě změňte toto heslo!

## Konfigurace aplikace

### 1. Úprava konfiguračního souboru

```bash
nano /var/www/hockey-prediction-app/backend/.env
```

Upravte následující hodnoty:
- `PORT`: Port, na kterém běží backend (výchozí: 5000)
- `NODE_ENV`: Nastavte na "production"
- `MONGO_URI`: MongoDB připojovací řetězec (výchozí: mongodb://localhost:27017/hockey-prediction)
- `JWT_SECRET`: Tajný klíč pro JWT tokeny (změňte na náhodný řetězec)
- `SPORTS_DB_API_KEY`: API klíč pro TheSportsDB (výchozí: 3)

Uložte soubor stisknutím `Ctrl+X`, poté `Y` a `Enter`.

### 2. Restart aplikace

```bash
cd /var/www/hockey-prediction-app/backend
pm2 restart hockey-app
```

## Spuštění aplikace

Po dokončení nasazení by měla být vaše aplikace dostupná na:

https://malinon.cyou

Přihlaste se pomocí administrátorského účtu:
- Email: admin@example.com
- Heslo: admin123

Nezapomeňte ihned změnit heslo v sekci "Můj profil".

## Údržba a aktualizace

### Aktualizace aplikace

Pokud provedete změny v kódu a nahrajete je do GitHub repozitáře, můžete aplikaci aktualizovat takto:

```bash
cd /var/www/hockey-prediction-app
./deployment/deploy-app.sh
```

### Kontrola logů

```bash
# Zobrazení stavu PM2 procesů
pm2 status

# Zobrazení logů aplikace
pm2 logs hockey-app

# Zobrazení pouze chybových logů
pm2 logs hockey-app --err
```

### Restart aplikace

```bash
pm2 restart hockey-app
```

### Restart webového serveru

```bash
systemctl restart nginx
```

## Řešení problémů

### Aplikace není dostupná

1. Zkontrolujte, zda běží Node.js proces:
```bash
pm2 status
```

2. Zkontrolujte logy aplikace:
```bash
pm2 logs hockey-app
```

3. Zkontrolujte, zda běží Nginx:
```bash
systemctl status nginx
```

4. Zkontrolujte logy Nginx:
```bash
cat /var/log/nginx/error.log
```

### Problémy s databází

1. Zkontrolujte, zda běží MongoDB:
```bash
systemctl status mongod
```

2. Restart MongoDB:
```bash
systemctl restart mongod
```

### Obnovení SSL certifikátu

Certifikáty Let's Encrypt se automaticky obnovují, ale pokud potřebujete obnovit certifikát ručně:

```bash
certbot renew
```

---

V případě jakýchkoli problémů nebo dotazů kontaktujte podporu nebo konzultujte dokumentaci jednotlivých komponent (Node.js, MongoDB, Nginx, PM2).
