const logger = require('../services/logger');
const Database = require('../services/db');

const getLinkedContacts = async (phoneNumber, email) => {
    try {
        const DB = new Database();
        const query_result = await DB.query(`
            SELECT DISTINCT id, email, phoneNumber, createdAt FROM ((SELECT id, email, phoneNumber, createdAt
            FROM Contact
            WHERE id IN (
                SELECT
                CASE WHEN linkedId IS NOT NULL THEN linkedId ELSE id END AS id
                FROM
                Contact
                WHERE
                email = "${email}" OR phoneNumber = "${phoneNumber}"
            )
            ORDER BY createdAt ASC)
            UNION
            (SELECT id, email, phoneNumber, createdAt FROM Contact WHERE linkedId IN (
                SELECT id
                FROM Contact
                WHERE id IN (
                    SELECT
                    CASE WHEN linkedId IS NOT NULL THEN linkedId ELSE id END AS id
                    FROM
                    Contact
                    WHERE
                    email = "${email}" OR phoneNumber = "${phoneNumber}"
                )
            ))) AS required_data;
        `);
        DB.close();
        return query_result;
    } catch (err) {
        logger.error(err.stash);
    }
};

module.exports = {
    getLinkedContacts
};