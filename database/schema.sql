-- HOUSES TABLE

CREATE TABLE houses (

    id SERIAL PRIMARY KEY,

    name VARCHAR(100) NOT NULL,

    owner VARCHAR(100) NOT NULL,

    description TEXT NOT NULL,

    year_built INTEGER CHECK (year_built >= 1900
    AND year_built <= EXTRACT(YEAR FROM CURRENT_DATE)),

    village VARCHAR(100) NOT NULL,

    sector VARCHAR(100) NOT NULL,

    district VARCHAR(100) NOT NULL,

    province VARCHAR(100) NOT NULL,

    country VARCHAR(100) NOT NULL DEFAULT 'Rwanda',

    latitude DECIMAL(10,7) CHECK (latitude BETWEEN -90 AND 90),

    longitude DECIMAL(10,7) CHECK (longitude BETWEEN -180 AND 180),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP

);

-- ROOMS TABLE

CREATE TABLE rooms (

    id SERIAL PRIMARY KEY,

    house_id INTEGER NOT NULL,

    name VARCHAR(100) NOT NULL,

    floor VARCHAR(50),

    length DECIMAL(5,2) CHECK(length > 0),

    width DECIMAL(5,2) CHECK(width > 0),

    description TEXT,

    image_url VARCHAR(255),

    CONSTRAINT fk_room_house FOREIGN KEY(house_id) REFERENCES houses(id) ON DELETE CASCADE

);


-- MATERIALS TABLE

CREATE TABLE materials (

    id SERIAL PRIMARY KEY,

    house_id INTEGER NOT NULL,

    component VARCHAR(100) NOT NULL,

    material_name VARCHAR(100) NOT NULL,

    description TEXT,

    CONSTRAINT fk_material_house FOREIGN KEY(house_id) REFERENCES houses(id) ON DELETE CASCADE

);

-- GALLERY TABLE

CREATE TABLE gallery (

    id SERIAL PRIMARY KEY,

    house_id INTEGER NOT NULL,

    image_url TEXT NOT NULL,

    caption VARCHAR(255),

    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_gallery_house FOREIGN KEY(house_id) REFERENCES houses(id) ON DELETE CASCADE

);

-- HISTORY TABLE

CREATE TABLE history (

    id SERIAL PRIMARY KEY,

    house_id INTEGER NOT NULL,

    title VARCHAR(150) NOT NULL,

    description TEXT,

    event_date DATE,

    CONSTRAINT fk_history_house FOREIGN KEY(house_id) REFERENCES houses(id) ON DELETE CASCADE

);

-- NEARBY PLACES TABLE

CREATE TABLE nearby_places (

    id SERIAL PRIMARY KEY,

    house_id INTEGER NOT NULL,

    name VARCHAR(100) NOT NULL,

    category VARCHAR(50),

    distance_meters INTEGER CHECK (distance_meters >= 0),

    description TEXT,

    CONSTRAINT fk_place_house FOREIGN KEY(house_id) REFERENCES houses(id) ON DELETE CASCADE

);

-- ADMINISTRATORS TABLE

CREATE TABLE administrators (

    id SERIAL PRIMARY KEY,

    full_name VARCHAR(100) NOT NULL,

    email VARCHAR(150) UNIQUE NOT NULL,

    password_hash VARCHAR(255) NOT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP

);

-- INDEXES

CREATE INDEX idx_rooms_house
ON rooms(house_id);

CREATE INDEX idx_gallery_house
ON gallery(house_id);

CREATE INDEX idx_materials_house
ON materials(house_id);

CREATE INDEX idx_history_house
ON history(house_id);

CREATE INDEX idx_places_house
ON nearby_places(house_id);