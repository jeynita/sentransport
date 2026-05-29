import { useState, useEffect } from 'react';
import Carte from './Carte';
import './App.css';
import Header from './Header';
import Recherche from './Recherche';
import LigneBus from './LigneBus';
import DetailLigne from './DetailLigne';
import Footer from './Footer';

function App() {
  const [lignes, setLignes] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState(null);
  
  const [recherche, setRecherche] = useState("");
  const [ligneSelectionnee, setLigneSelectionnee] = useState(null);
  const [compteur, setCompteur] = useState(0);

  // Fonction extraite pour l'Exercice 1
  const chargerDonnees = () => {
    setChargement(true);
    setErreur(null);

    fetch("http://localhost:5000/lignes")
      .then(response => {
        if (!response.ok) {
          throw new Error("Erreur serveur : " + response.status);
        }
        return response.json();
      })
      .then(data => {
        setLignes(data);
        setChargement(false);
      })
      .catch(error => {
        setErreur(error.message);
        setChargement(false);
      });
  };

  // Appel unique au chargement initial de l'application
  useEffect(() => {
    chargerDonnees();
  }, []);

  const gererRecherche = (valeur) => {
    setRecherche(valeur);
    setCompteur(compteur + 1);
  };

  const lignesFiltrees = lignes.filter((l) =>
    l.depart.toLowerCase().includes(recherche.toLowerCase()) ||
    l.arrivee.toLowerCase().includes(recherche.toLowerCase()) ||
    l.numero.includes(recherche)
  );

  function handleClickLigne(ligne) {
    if (ligneSelectionnee && ligneSelectionnee.id === ligne.id) {
      setLigneSelectionnee(null);
    } else {
      setLigneSelectionnee(ligne);
    }
  }

  if (chargement) {
    return (
      <div className="chargement">
        <p>Chargement des lignes de bus...</p>
      </div>
    );
  }

  if (erreur) {
    return (
      <div className="erreur">
        <p>Erreur lors de la récupération des données : {erreur}</p>
        <button onClick={chargerDonnees} className="btn-recharger" style={{ marginTop: '15px', padding: '10px 20px', cursor: 'pointer' }}>
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="App">
      <Header />
      <main className="contenu">
        <Recherche 
          valeur={recherche} 
          onChange={gererRecherche} 
          onEffacer={() => setRecherche("")} 
        />

        <p className="compteur">Vous avez effectué {compteur} recherche(s).</p>
        
        {/* Bouton de rechargement demandé par l'Exercice 1 */}
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <button onClick={chargerDonnees} className="btn-recharger" style={{ padding: '10px 20px', cursor: 'pointer', backgroundColor: '#2e7d32', color: 'white', border: 'none', borderRadius: '4px', fontWeight: 'bold' }}>
            Recharger les données ...
          </button>
        </div>
        
        {lignesFiltrees.length === 0 ? (
          <div className="aucun-resultat">
            <p>Aucune ligne trouvée pour "{recherche}"</p>
          </div>
        ) : (
          <p className="resultat-recherche">
            {lignesFiltrees.length} ligne{lignesFiltrees.length > 1 ? 's' : ''} trouvée{lignesFiltrees.length > 1 ? 's' : ''}
          </p>
        )}

        {lignesFiltrees.map((ligne) => (
          <LigneBus
            key={ligne.id}
            numero={ligne.numero}
            depart={ligne.depart}
            arrivee={ligne.arrivee}
            arrets={ligne.arrets}
            estSelectionnee={ligneSelectionnee && ligneSelectionnee.id === ligne.id}
            onClick={() => handleClickLigne(ligne)}
          />
        ))}

        {ligneSelectionnee && <DetailLigne ligne={ligneSelectionnee} />}
        <Carte />
      </main>
      <Footer />
    </div>
  );
}

export default App;