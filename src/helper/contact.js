const logger = require('../services/logger');
const Database = require('../services/db');

const getIds = (data) => {
    let result = '';
    for (let i = 1; i < data.length; i++) {
        result += data[i].id;
        if (i < data.length - 1) {
            result += ', ';
        }
    }
    return result;
};

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
        // console.log({query_result});
        if(query_result.length > 1) {
            const secondaryIds = getIds(query_result);
            // console.log({secondaryIds});
            const updateQuery = `UPDATE Contact SET linkedId = ${query_result[0].id}, linkPrecedence = "secondary", updatedAt = NOW() WHERE id IN (${secondaryIds}) AND (linkedId != ${query_result[0].id} OR linkPrecedence != "secondary");`;
            // console.log(updateQuery);
            const x = await DB.query(updateQuery);            
            // console.log(x);
        }
        DB.close();
        // console.log({query_result});
        return query_result;
    } catch (err) {
        logger.error(err.stack);
    }
};

module.exports = {
    getLinkedContacts
};