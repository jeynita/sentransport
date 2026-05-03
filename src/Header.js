    import './Header.css';

    function Header() {
      //date du jour
        const dateJournalier = new Date().toLocaleDateString('fr-FR');
        return (
        <header className="header">
        <h1 className="header-titre">SenTransport</h1>
        <p className="header-soustitre">
            Votre guide du transport en commun a Dakar
        </p>
        <p classname="header-date">Date : {dateJournalier}</p>
        </header>
    );
    }

    export default Header;