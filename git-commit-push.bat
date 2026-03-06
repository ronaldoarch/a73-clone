@echo off
chcp 65001 >nul
cd /d "e:\chinesa"

echo === Configurando remote ===
git remote remove origin 2>nul
git remote add origin https://github.com/ronaldoarch/a73-clone.git

echo.
echo === Adicionando ficheiros ===
git add .

echo.
echo === Estado ===
git status

echo.
echo === Commit ===
git commit -m "Update: commit e push para a73-clone"

echo.
echo === Push ===
git push -u origin main
if errorlevel 1 git push -u origin master

pause
