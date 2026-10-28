const pool = require("../config/db");
const { imageMetadataColumns } = require("../utils/images");

const HOUSE_COLUMNS = `
    houses.id,
    houses.name,
    houses.owner,
    houses.description,
    houses.year_built,
    houses.village,
    houses.sector,
    houses.district,
    houses.province,
    houses.country,
    houses.latitude,
    houses.longitude,
    houses.created_at,
    ${imageMetadataColumns("houses")}
`;

const FIELDS = [
    "name",
    "owner",
    "description",
    "year_built",
    "village",
    "sector",
    "district",
    "province",
    "country",
    "latitude",
    "longitude"
];

const valuesOf = house => FIELDS.map(field => house[field] ?? null);

// Get all houses
const getAllHouses = async () => {
  const result = await pool.query(`
    SELECT ${HOUSE_COLUMNS}
    FROM houses
    ORDER BY id ASC;
  `);

  return result.rows;
};

// Get one house by ID
const getHouseById = async (id) => {
  const result = await pool.query(
    `
      SELECT ${HOUSE_COLUMNS}
      FROM houses
      WHERE id = $1;
    `,
    [id]
  );

  return result.rows[0] || null;
};

const getHouseImageById = async (id) => {
  const result = await pool.query(
    `SELECT image_data, image_mime_type FROM houses WHERE id = $1;`,
    [id]
  );

  return result.rows[0] || null;
};

// Create house
const createHouse = async (house, image = null) => {
  const result = await pool.query(
    `INSERT INTO houses (${FIELDS.join(", ")}, image_data, image_mime_type, image_updated_at)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13, CASE WHEN $12::bytea IS NULL THEN NULL ELSE CURRENT_TIMESTAMP END)
     RETURNING ${HOUSE_COLUMNS}`,
    [...valuesOf(house), image?.buffer || null, image?.mimetype || null]
  );

  return result.rows[0];
};

// Update house. The stored image is only replaced when a new file is given.
const updateHouse = async (id, house, image = null) => {
  const assignments = FIELDS.map((field, index) => `${field} = $${index + 1}`);
  const values = valuesOf(house);

  if (image) {
    values.push(image.buffer, image.mimetype);
    assignments.push(
      `image_data = $${values.length - 1}`,
      `image_mime_type = $${values.length}`,
      "image_updated_at = CURRENT_TIMESTAMP"
    );
  }

  values.push(id);

  const result = await pool.query(
    `
      UPDATE houses
      SET ${assignments.join(", ")}
      WHERE id = $${values.length}
      RETURNING ${HOUSE_COLUMNS};
    `,
    values
  );

  return result.rows[0] || null;
};

// Delete house
const deleteHouse = async (id) => {
  const result = await pool.query(
    `
      DELETE FROM houses
      WHERE id = $1
      RETURNING id, name;
    `,
    [id]
  );

  return result.rows[0] || null;
};

module.exports = {
  getAllHouses,
  getHouseById,
  getHouseImageById,
  createHouse,
  updateHouse,
  deleteHouse,
};
