import { useState, useEffect } from 'react';
import './DetailLigne.css';

function DetailLigne({ ligne }) {
  const [details, setDetails] = useState(null);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState(null);

  useEffect(() => {
    if (!ligne) return;

    setChargement(true);
    setErreur(null);

    // Récupération des détails à la demande (Exercice 3)
    fetch(`http://localhost:5000/lignes/${ligne.id}`)
      .then(response => {
        if (!response.ok) {
          throw new Error("Impossible de charger les arrêts pour cette ligne.");
        }
        return response.json();
      })
      .then(data => {
        setDetails(data);
        setChargement(false);
      })
      .catch(error => {
        setErreur(error.message);
        setChargement(false);
      });
  }, [ligne]); // Se déclenche à chaque fois que la ligne sélectionnée change

  if (!ligne) return null;

  return (
    <div className="detail-ligne">
      <h3 className="detail-titre">
        Ligne {ligne.numero} : {ligne.depart} &rarr; {ligne.arrivee}
      </h3>
      <p className="detail-info">
        {ligne.arrets} arrêts sur ce trajet
      </p>
      
      <div className="detail-arrets">
        <h4>Arrêts principaux :</h4>
        
        {chargement && (
          <p className="detail-info" style={{ fontStyle: 'italic', color: '#666' }}>
            Chargement des arrêts depuis le serveur...
          </p>
        )}
        
        {erreur && (
          <p className="detail-info" style={{ color: 'red', fontWeight: 'bold' }}>
            {erreur}
          </p>
        )}
        
        {!chargement && !erreur && details && details.listeArrets && (
          <ul className="detail-liste">
            {details.listeArrets.map((arret, index) => (
              <li key={index} className="detail-arret">
                <span className="arret-numero">{index + 1}</span>
                <span className="arret-nom">{arret}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default DetailLigne;