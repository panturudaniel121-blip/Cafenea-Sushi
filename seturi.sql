DROP TABLE IF EXISTS asociere_set CASCADE;
DROP TABLE IF EXISTS seturi CASCADE;

CREATE TABLE seturi (
    id SERIAL PRIMARY KEY,
    nume_set VARCHAR(100) NOT NULL,
    descriere_set TEXT
);

CREATE TABLE asociere_set (
    id SERIAL PRIMARY KEY,
    id_set INT REFERENCES seturi(id) ON DELETE CASCADE,
    id_produs INT REFERENCES produse(id) ON DELETE CASCADE
);

INSERT INTO seturi (nume_set, descriere_set) VALUES
('Set Matcha & Somon', 'O combinație clasică între finețea matcha și prospețimea somonului.'),
('Set Vegan Fresh', 'Un meniu de vară pe bază de plante, cu note răcoroase și gust echilibrat.'),
('Set Tempura Choco', 'Pentru cei care adoră creveții crocanți, urmați de o notă dulce de cafea și ciocolată.'),
('Set Pui Hot', 'Rulou picant de pui katsu echilibrat de bogăția unei ciocolate calde reconfortante.'),
('Set Clasic Japonez', 'Esența tradiției asiatice: ceai verde infuzat perfect și nigiri delicat cu ton roșu.');

INSERT INTO asociere_set (id_set, id_produs) VALUES
((SELECT id FROM seturi WHERE nume_set = 'Set Matcha & Somon'), (SELECT id FROM produse WHERE nume = 'Special Matcha')),
((SELECT id FROM seturi WHERE nume_set = 'Set Matcha & Somon'), (SELECT id FROM produse WHERE nume = 'Sushi cu somon')),

((SELECT id FROM seturi WHERE nume_set = 'Set Vegan Fresh'), (SELECT id FROM produse WHERE nume = 'Iced Matcha')),
((SELECT id FROM seturi WHERE nume_set = 'Set Vegan Fresh'), (SELECT id FROM produse WHERE nume = 'Sushi vegan')),

((SELECT id FROM seturi WHERE nume_set = 'Set Tempura Choco'), (SELECT id FROM produse WHERE nume = 'Latte cu ciocolata')),
((SELECT id FROM seturi WHERE nume_set = 'Set Tempura Choco'), (SELECT id FROM produse WHERE nume = 'Rulou de creveți tempura')),

((SELECT id FROM seturi WHERE nume_set = 'Set Pui Hot'), (SELECT id FROM produse WHERE nume = 'Ciocolata calda')),
((SELECT id FROM seturi WHERE nume_set = 'Set Pui Hot'), (SELECT id FROM produse WHERE nume = 'Rulou katsu de pui picant')),

((SELECT id FROM seturi WHERE nume_set = 'Set Clasic Japonez'), (SELECT id FROM produse WHERE nume = 'Ceai Verde Sencha')),
((SELECT id FROM seturi WHERE nume_set = 'Set Clasic Japonez'), (SELECT id FROM produse WHERE nume = 'Nigiri cu Ton'));

GRANT ALL PRIVILEGES ON DATABASE cti_2026 TO daniel;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO daniel;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO daniel;