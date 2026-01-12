@echo off
setlocal
cd /d "%~dp0"

echo Arrancando a Aiko... 🌸
echo Por favor espera unos segundos...

:: Inicia el servidor en una ventana minimizada
start /min cmd /c "npm run dev"

:: Espera 4 segundos para que Vite cargue
timeout /t 4 /nobreak >nul

:: Abre el navegador
start http://localhost:5173

echo.
echo Aiko esta lista! Puedes minimizar esta ventana, pero no la cierres.
echo.
exit
