@echo off
echo Deteniendo todos los procesos de Aiko (Node.js)...
taskkill /F /IM node.exe
echo.
echo !Aiko se ha desconectado! 
echo Puedes cerrar esta ventana.
timeout /t 3
