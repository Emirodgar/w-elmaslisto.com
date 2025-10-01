@ECHO OFF
cd C:\wamp\www\w-elmaslisto.com\int
py getquestions.py

TIMEOUT 10

echo Commit on GitHub
echo.

git.exe add .
git.exe commit -am "Updated questions
git.exe push

echo.
echo All done :)

pause
