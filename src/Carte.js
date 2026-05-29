import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './Carte.css';

// Corriger les icones Leaflet (bug webpack)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker.png',
  shadowUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// EXERCICE 1 : Déclaration de l'icône rouge pour l'arrêt le plus proche
const iconeArretProche = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// EXERCICE 2 : Composant enfant pour accéder à l'objet carte via useMap()
function BoutonCentrer({ position }) {
  const map = useMap();
  if (!position) return null;

  return (
    <button
      onClick={() => map.setView(position, 15)}
      className="btn-centrer"
      style={{
        position: 'absolute',
        bottom: '20px',
        left: '20px',
        zIndex: 1000,
        backgroundColor: '#0a6e31',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        padding: '10px 15px',
        cursor: 'pointer',
        fontWeight: 'bold',
        boxShadow: '0px 2px 5px rgba(0,0,0,0.3)'
      }}
    >
      🎯 Centrer sur ma position
    </button>
  );
}

// Calculer la distance entre 2 points GPS (km)
function calculerDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // rayon de la Terre en km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) *
    Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function Carte() {
  const [arrets, setArrets] = useState([]);
  const [positionUtilisateur, setPositionUtilisateur] = useState(null);
  
  // EXERCICE 3 : Remplacement de l'ancien état unique par un tableau pour stocker les 3 arrêts
  const [les3ArretsProches, setLes3ArretsProches] = useState([]);

  const DAKAR = [14.6928, -17.4467];

  // Charger les arrets depuis Flask
  useEffect(() => {
    fetch("http://localhost:5000/arrets")
      .then(r => r.json())
      .then(data => setArrets(data))
      .catch(err => {
        console.error("Erreur arrets :", err);
      });
  }, []);

  // Géolocalisation fixe pour le test à Dakar
  useEffect(() => {
    setPositionUtilisateur([14.6915, -17.4475]);
  }, []);

  // EXERCICE 3 : Nouvelle logique pour calculer, trier et conserver les 3 arrêts les plus proches
  useEffect(() => {
    if (positionUtilisateur && arrets.length > 0) {
      // 1. Calculer la distance pour chaque arrêt
      const arretsAvecDistance = arrets.map(a => {
        const d = calculerDistance(
          positionUtilisateur[0],
          positionUtilisateur[1],
          a.lat,
          a.lon
        );
        return { ...a, distance: d };
      });

      // 2. Trier du plus proche au plus lointain
      arretsAvecDistance.sort((x, y) => x.distance - y.distance);

      // 3. Conserver uniquement les 3 premiers
      setLes3ArretsProches(arretsAvecDistance.slice(0, 3));
    }
  }, [positionUtilisateur, arrets]);

  return (
    <div className="carte-container" style={{ position: 'relative' }}>
      <h2 className="carte-titre">Carte des arrets</h2>
      
      {/* EXERCICE 3 : Rendu textuel de la liste des 3 arrêts les plus proches au-dessus de la carte */}
      {les3ArretsProches.length > 0 && (
        <div className="arrets-proches-container" style={{ marginBottom: '15px', backgroundColor: '#f9f9f9', padding: '10px', borderRadius: '5px', borderLeft: '5px solid #0a6e31' }}>
          <h4 style={{ margin: '0 0 8px 0', color: '#2c3e50' }}>📌 Les 3 arrêts les plus proches :</h4>
          <ul style={{ listStyleType: 'none', paddingLeft: 0, margin: 0 }}>
            {les3ArretsProches.map((a, index) => (
              <li key={a.id} style={{ margin: '4px 0', fontSize: '14px' }}>
                <strong>{index + 1}. {a.nom}</strong> — à {a.distance.toFixed(1)} km (Lignes : {a.lignes.join(", ")})
              </li>
            ))}
          </ul>
        </div>
      )}
      
      <MapContainer center={DAKAR} zoom={13} className="carte">
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap"
        />
        
        {/* EXERCICE 1 & 3 : On met en rouge l'arrêt le plus proche (le premier du tableau [0]) */}
        {arrets.map(a => {
          const estLePlusProche = les3ArretsProches[0] && les3ArretsProches[0].id === a.id;

          return (
            <Marker 
              key={a.id} 
              position={[a.lat, a.lon]}
              icon={estLePlusProche ? iconeArretProche : new L.Icon.Default()}
            >
              <Popup>
                <strong>{a.nom}</strong>
                {estLePlusProche && <span style={{ color: 'red', fontWeight: 'bold' }}> (Plus proche !)</span>}
                <br />
                Lignes : {a.lignes.join(", ")}
              </Popup>
            </Marker>
          );
        })}

        {positionUtilisateur && (
          <Marker position={positionUtilisateur}>
            <Popup>Vous etes ici</Popup>
          </Marker>
        )}

        {/* EXERCICE 2 : Bouton de recentrage */}
        <BoutonCentrer position={positionUtilisateur} />

      </MapContainer>
    </div>
  );
}

export default Carte;