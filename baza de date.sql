DROP TABLE IF EXISTS produse CASCADE;
DROP TYPE IF EXISTS tip_produs CASCADE;
DROP TYPE IF EXISTS categorie_secundara CASCADE;

CREATE TYPE tip_produs AS ENUM(
    'cafea/ceai', 
    'sushi', 
    'desert'
);

CREATE TYPE categorie_secundara AS ENUM(
    'traditional', 
    'fusion', 
    'premium', 
    'sezon', 
    'experiment'
);

CREATE TABLE produse (
    id SERIAL PRIMARY KEY,
    nume VARCHAR(100) UNIQUE NOT NULL,
    descriere TEXT,
    pret NUMERIC(8,2) NOT NULL CHECK (pret >= 0),
    cantitate INT NOT NULL CHECK (cantitate > 0),
    calorii INT NOT NULL CHECK (calorii >= 0),
    tip_produs tip_produs DEFAULT 'cafea/ceai',
    categorie_mica categorie_secundara DEFAULT 'traditional',
    temperatura_servire VARCHAR(20) CHECK (temperatura_servire IN ('fierbinte', 'rece', 'temperatura camerei', 'cu gheata')),
    ingrediente VARCHAR[],
    este_vegan BOOLEAN NOT NULL DEFAULT FALSE,
    imagine VARCHAR(300),
    data_adaugare TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO produse (
    nume, descriere, pret, cantitate, calorii, tip_produs, categorie_mica, temperatura_servire, ingrediente, este_vegan, imagine
) VALUES 
('Special Matcha', 'Matcha de cea mai înaltă calitate, preparată ceremonial.', 25.00, 200, 80, 'cafea/ceai', 'premium', 'fierbinte', '{"pudra matcha premium", "apa", "lapte de migdale"}', True, 'special-matcha.jpg'),
('Iced Matcha', 'Varianta de vară a celebrei băuturi verzi.', 22.00, 300, 110, 'cafea/ceai', 'sezon', 'cu gheata', '{"pudra matcha", "apa", "lapte de ovaz", "gheata", "sirop de agave"}', True, 'iced-matcha.jpg'),
('Latte cu ciocolata', 'Un amestec echilibrat de espresso, lapte cremos și sirop fin de ciocolată.', 21.00, 300, 320, 'cafea/ceai', 'fusion', 'fierbinte', '{"espresso", "lapte", "sirop de ciocolata"}', False, 'latte-ciocolata.png'),
('Frape cu ciocolata', 'Un munte de frișcă și ciocolată cu un strop de espresso.', 24.00, 400, 550, 'cafea/ceai', 'fusion', 'cu gheata', '{"espresso", "lapte", "sos de ciocolata", "frisca", "gheata"}', False, 'frape-ciocolata.jpg'),
('Sushi cu somon', 'Clasicul maki cu somon proaspăt.', 30.00, 180, 250, 'sushi', 'traditional', 'rece', '{"orez", "alge nori", "somon crud"}', False, 'sushi-somon.png'),
('Sushi vegan', 'Un curcubeu vegetal rulat în orez.', 28.00, 200, 180, 'sushi', 'experiment', 'temperatura camerei', '{"orez", "alge nori", "castravete", "avocado", "morcov", "ardei"}', True, 'sushi-vegan.jpg'),
('Ciocolata calda', 'Densă, bogată și suficient de fierbinte să te încălzească.', 18.00, 250, 400, 'cafea/ceai', 'traditional', 'fierbinte', '{"ciocolata neagra topita", "lapte", "zahar", "frisca"}', False, 'ciocolata-calda.jpg'),
('Sushi de paste', 'Invenție unde orezul este înlocuit cu paste fine.', 35.00, 220, 310, 'sushi', 'fusion', 'temperatura camerei', '{"paste capellini", "alge nori", "crema de branza", "somon afumat"}', False, 'sushi-paste.png'),
('Rulou de creveți tempura', 'Creveți crocanți la interior, orez pufos la exterior.', 45.00, 240, 380, 'sushi', 'premium', 'temperatura camerei', '{"orez", "alge nori", "creveti", "aluat tempura", "sos spicy mayo"}', False, 'rulou-creveti-tempura.png'),
('Rulou katsu de pui picant', 'Rulou cu pui fraged pane și sos iute.', 38.00, 250, 420, 'sushi', 'fusion', 'temperatura camerei', '{"orez", "alge nori", "pui katsu", "sos sriracha", "castravete"}', False, 'rulou-pui-katsu.jpg'),
('Rulou california', 'Varianta cu surimi, avocado și icre tobiko.', 32.00, 220, 290, 'sushi', 'traditional', 'temperatura camerei', '{"orez", "alge nori", "surimi", "avocado", "castravete", "icre tobiko"}', False, 'rulou-california.png'),
('Mochi cu Inghetata', 'Aluat de orez lipicios umplut cu înghețată rece.', 20.00, 150, 280, 'desert', 'fusion', 'rece', '{"faina de orez", "zahar", "inghetata de vanilie"}', False, 'mochi-inghetata.jpg'),
('Americano Lung', 'Apă fierbinte cu shot dublu de espresso.', 12.00, 300, 10, 'cafea/ceai', 'traditional', 'fierbinte', '{"apa", "espresso"}', True, 'americano.jpg'),
('Nigiri cu Ton', 'Ton roșu proaspăt așezat pe orez de sushi.', 34.00, 120, 140, 'sushi', 'traditional', 'rece', '{"orez", "ton crud", "wasabi"}', False, 'nigiri-ton.jpg'),
('Ceai Verde Sencha', 'Infuzie de frunze de ceai verde japonez.', 16.00, 250, 5, 'cafea/ceai', 'traditional', 'fierbinte', '{"frunze de ceai verde", "apa"}', True, 'sencha.jpg'),
('Espresso Tonic', 'Cafea espresso cu apă tonică și gheață.', 24.00, 250, 60, 'cafea/ceai', 'experiment', 'cu gheata', '{"espresso", "apa tonica", "gheata", "lamaie"}', True, 'espresso-tonic.jpg'),
('Nigiri cu Omleta Yuzu', 'Omletă fină japoneză cu aromă de yuzu pe orez.', 26.00, 130, 190, 'sushi', 'fusion', 'temperatura camerei', '{"orez", "omleta tamago", "suc de yuzu", "alge nori"}', False, 'nigiri-tamago.png'),
('Cheesecake cu Matcha', 'Prăjitură cu cremă de brânză și pudră matcha.', 28.00, 200, 480, 'desert', 'fusion', 'rece', '{"crema de branza", "pudra matcha", "biscuiti", "unt", "zahar"}', False, 'cheesecake-matcha.jpg'),
('Rulou Curcubeu', 'Maki acoperit cu diverse tipuri de pește și avocado.', 55.00, 280, 410, 'sushi', 'premium', 'temperatura camerei', '{"orez", "alge nori", "surimi", "somon", "ton", "avocado", "creveti"}', False, 'rulou-curcubeu.jpg'),
('Cappuccino cu Migdale', 'Cafea cu lapte de migdale și spumă bogată.', 17.00, 200, 95, 'cafea/ceai', 'traditional', 'fierbinte', '{"cafea", "lapte de migdale", "apa"}', True, 'cappuccino-migdale.jpg'),
('Temaki cu Creveți', 'Sushi sub formă de con, rulat manual.', 31.00, 150, 210, 'sushi', 'traditional', 'temperatura camerei', '{"orez", "nori", "creveti", "avocado"}', False, 'temaki-creveti.jpg'),
('Macarons asortate', 'Set de macarons fine franțuzești cu diverse arome', 45.00, 150, 380, 'desert', 'premium', 'temperatura camerei', '{"faina de migdale", "zahar", "albus de ou", "crema de fistic", "ciocolata neagra", "piure de zmeura"}', False, 'macarons.jpg');
GRANT ALL PRIVILEGES ON DATABASE cti_2026 TO daniel;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO daniel;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO daniel;