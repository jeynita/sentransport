    import './Header.css';

    function Header() {
    // Date du jour automatique
    const dateJournalier = new Date().toLocaleDateString('fr-FR');

    return (
        <header className="sen-transport-header">
        <h1 className="header-titre">SenTransport</h1>
        <p className="header-soustitre">
            Votre guide du transport en commun a Dakar
        </p>
        <p className="header-date">
            <span>Date : {dateJournalier}</span>
        </p>
        </header>
    );
    }

    export default Header;