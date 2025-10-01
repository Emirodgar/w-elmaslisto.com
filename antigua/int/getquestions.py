import json, urllib.request, random

spreadsheetID = "1gZbPx9GpNMObvXzlGRGmah1sW7nCgLIHR-QOocybwXw"
tab = 1
finalUrl = "https://spreadsheets.google.com/feeds/list/" + str(spreadsheetID) + "/1/public/values?alt=json"

with urllib.request.urlopen(finalUrl) as url:
    data = json.loads(url.read().decode())

qs = "const myQuiz = ["

for p in data['feed']['entry']:
  i = random.randint(1, 100)
  if(i < 1):
    qs += "{'q':'"+p['title']['$t']+"', 'options': ['"+ p['gsx$correcta']['$t'] + "', '"+ p['gsx$incorrecta']['$t'] + "' ], 'correctIndex': 0, 'correctResponse':'"+ p['gsx$respuesta']['$t'] + "' },"
  else:
    qs += "{'q':'"+p['title']['$t']+"', 'options': ['"+ p['gsx$incorrecta']['$t'] + "', '"+ p['gsx$correcta']['$t'] + "' ], 'correctIndex': 1, 'correctResponse':'"+ p['gsx$respuesta']['$t'] + "' },"

qs = qs[:-1]
qs += "];"

qs += " $('#quiz').quiz({ counterFormat: 'Pregunta %current de %total', nextButtonText:'Siguiente',  finishButtonText:'Terminar', restartButtonText:'Reiniciar', questions: myQuiz});"


with open("qs.js", "w", encoding="utf-8") as f:
    f.write(qs)
