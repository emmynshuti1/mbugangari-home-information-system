const pool = require("../config/db");

// Get all houses
const getAllHouses = async () => {
  const result = await pool.query(`
    SELECT *
    FROM houses
    ORDER BY id ASC;
  `);

  return result.rows;
};

// Get one house by ID
const getHouseById = async (id) => {
  const result = await pool.query(
    `
      SELECT *
      FROM houses
      WHERE id = $1;
    `,
    [id]
  );

  return result.rows[0] || null;
};

// Create house
const createHouse = async (house) => {
  const {
    name,
    owner,
    description,
    year_built,
    village,
    sector,
    district,
    province,
    country,
    latitude,
    longitude,
  } = house;

  const result = await pool.query(
    `
      INSERT INTO houses (
        name,
        owner,
        description,
        year_built,
        village,
        sector,
        district,
        province,
        country,
        latitude,
        longitude
      )
      VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11
      )
      RETURNING *;
    `,
    [
      name.trim(),
      owner.trim(),
      description.trim(),
      year_built || null,
      village.trim(),
      sector.trim(),
      district.trim(),
      province.trim(),
      country.trim(),
      latitude || null,
      longitude || null,
    ]
  );

  return result.rows[0];
};

// Update house
const updateHouse = async (id, house) => {
  const {
    name,
    owner,
    description,
    year_built,
    village,
    sector,
    district,
    province,
    country,
    latitude,
    longitude,
  } = house;

  const result = await pool.query(
    `
      UPDATE houses
      SET
        name = $1,
        owner = $2,
        description = $3,
        year_built = $4,
        village = $5,
        sector = $6,
        district = $7,
        province = $8,
        country = $9,
        latitude = $10,
        longitude = $11
      WHERE id = $12
      RETURNING *;
    `,
    [
      name.trim(),
      owner.trim(),
      description.trim(),
      year_built || null,
      village.trim(),
      sector.trim(),
      district.trim(),
      province.trim(),
      country.trim(),
      latitude || null,
      longitude || null,
      id,
    ]
  );

  return result.rows[0] || null;
};

// Delete house
const deleteHouse = async (id) => {
  const result = await pool.query(
    `
      DELETE FROM houses
      WHERE id = $1
      RETURNING *;
    `,
    [id]
  );

  return result.rows[0] || null;
};

module.exports = {
  getAllHouses,
  getHouseById,
  createHouse,
  updateHouse,
  deleteHouse,
};