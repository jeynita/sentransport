import json
from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Chargement de la liste des lignes de bus
with open("lignes_ddd.json", "r") as f:
    lignes = json.load(f)

# AJOUT LAB 6 (Étape 3) : Chargement du fichier des coordonnées GPS des arrêts
with open("arrets.json", "r") as f:
    arrets = json.load(f)

@app.route("/")
def accueil():
    return jsonify({
        "message": "Bienvenue sur l'API SenTransport !",
        "endpoints": ["/lignes", "/lignes/<id>", "/arrets"]
    })

@app.route("/lignes")
def get_lignes():
    return jsonify(lignes)

# Cet endpoint gère précisément l'Exercice 3 du Lab 5
@app.route("/lignes/<int:ligne_id>")
def get_ligne(ligne_id):
    ligne = next(
        (l for l in lignes if l["id"] == ligne_id),
        None
    )
    if ligne is None:
        return jsonify({"erreur": "Ligne non trouvee"}), 404
    return jsonify(ligne)

# NOUVEL ENDPOINT LAB 6 (Étape 3) : Renvoie le JSON complet avec les latitudes/longitudes
@app.route("/arrets")
def get_arrets():
    return jsonify(arrets)

@app.route("/stats")
def get_statistiques():
    total_lignes = len(lignes)
    total_arrets = 0
    ligne_max_arrets = None
    max_nb_arrets = -1
    
    for ligne in lignes:
        total_arrets += ligne["arrets"]
        
        if ligne["arrets"] > max_nb_arrets:
            max_nb_arrets = ligne["arrets"]
            ligne_max_arrets = ligne["numero"]

    return jsonify({
        "nombre_total_lignes": total_lignes,
        "nombre_total_arrets": total_arrets,
        "ligne_avec_le_plus_d_arrets": ligne_max_arrets
    })
    
@app.route("/lignes/recherche")
def rechercher_lignes():
    mot_cle = request.args.get("q", "").lower()
    resultats = []
    for ligne in lignes:
        depart_minuscule = ligne["depart"].lower()
        arrivee_minuscule = ligne["arrivee"].lower()
        
        if mot_cle in depart_minuscule or mot_cle in arrivee_minuscule:
            resultats.append(ligne)
    return jsonify(resultats)

if __name__ == "__main__":
    app.run(debug=True, port=5000)