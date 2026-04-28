# Instalar servidor en Linux

Esta guía recoje todo lo necesario para montar y desplegar la aplicación Aither en una máquina Linux

## Requisitos tecnológicos del sistema
### Node.js (>= 20)
```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
nvm install 20
nvm use 20
node -v
npm -v
```

### Gestor de procesos pm2
```bash
npm install -g pm2
```

### Servidor nginx como revrese proxy
```bash
sudo apt install nginx -y
```

### Versión de distribución de Linux más reciente por seguridad
##### 1. Se actualizan los paquetes y se eliminan dependencias obsoletas
```bash
sudo apt update
sudo apt upgrade -y
sudo apt dist-upgrade -y
sudo apt autoremove -y
```
##### 2. Reiniciar el sistema
```bash
sudo reboot
```
##### 3. Instalar la herramienta de actualización
```bash
sudo apt install update-manager-core
```
##### 4. Lanzar el proceso
```bash
sudo do-release-upgrade
```

### Gestor de túneles (para hacer pruebas de despliegue)
##### 1. Descarga de Ngrok
```bash
npx ngrok http 3000
```
##### 2. Configuración de cuenta, regístrate en la web de ngrok y copia tu token:
```
ngrok config add-authtoken TU_TOKEN
```
##### 3. Lanzar app
```bash
ngrok http PUERTO_DONDE_CORRA_TU_APP
```
##### 4. Acceder a app desde otro dispositivo (ngrok te dará una URL de este estilo):
```bash
https://abc123.ngrok.io
```

### Servicio de VPN (mayor seguridad y más correcto que los túneles)
##### 1 En Linux
###### 1.1 Descargar herramienta
```bash
curl -fsSL https://tailscale.com/install.sh | sh
```

###### 1.2 Arrancar y autenticar
```bash
sudo tailscape up
```
Te proporciona una URl, ábrela en el navehador y logueate con una cuenta de Google

##### 2 En Windows
###### 1.1 Descargar herramienta
Accede a https://tailscale.com/download y descarga el instalador

###### 1.2 Arrancar y autenticar
Ejecuta la herramienta, te pedirá loguearte, usa la **MISMA** cuenta de Google que en el servidor


## Pasos para montar la aplicación
### 1. Descargar aplicación 
```bash
git clone https://github.com/CauceloJuanma/Aither-AitherV-2.0.git
```

### 2. Instalar dependencias
```bash
cd REPOSITORIO
npm install
```

### 3. Configurar pm2
##### 3.1 Arrancar app
```bash
pm2 start npm --name "aither" -- start
```

##### 3.2 Verificar 
```bash
pm2 list
```

##### 3.3 Inicio automático al reiniciar el equipo
```bash
pm2 startup
pm2 save
```

### 4. Configuración servidor nginx
##### 4.1 Activar el servicio
```bash
sudo systemctl enable nginx
sudo systemctl start nginx
```

##### 4.2 Configurar como reverse proxy
```bash
sudo nano /etc/nginx/sites-available/aither
```
```bash
server {
    listen 80;
    server_name aither.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

##### 4.3 Activaer servidor
```bash
sudo ln -s /etc/nginx/sites-available/aither /etc/nginx/sites-enabled/
```

##### 4.4 Probar configuración
```bash
sudo nginx -t
```

##### 4.5 Reiniciar nginx para alicar configuración
```bash
sudo systemctl restart nginx
```

### 5. Abrir puertos para acceder desde máquinas externas
```bash
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

### 6. Acceso VPN
Conseguir url en Linux:
```bash
tailscale ip
```
Una vez realizada la instalación simplemente acceder a la url http://IP:3000 en la maquina externa

**Si la máquina es Windows se debe abrir Tailscape para conectarse a la VPN, en Linux se conecta por defeco al arrancar**
Para comprobar conecxión en Linux:
```bash
sudo systemctl status tailscaled
```


## Actualizar repositorio en caso de actualizar a una nueva versión de producción

### 1. Entrar al directorio donde está el proyecto
```bash
cd REPOSITORIO
```

### 2. Actualizar a última versión de git
```bash
git fetch
git reset --hard origin/main
```

### 3. Compilar aplicación
```bash
npm install # Si se han modificado dependencias
npm run build
```

### 4. Reiniciar el servicio
```bash
pm2 restart aither
```

### 5. Comprobar actualización
Se puede comprobar o bien en http://localhost:3000 en el propio servidor o accediendo desde la VPN de Tailscale desde otra máquina