const logger = require('../services/logger');
const Database = require('../services/db');
const { identifyAndUpdate } = require('../pipelines/identify.js');

const identify = async (req, res) => {
    try {
        // Add validator here..
        const { phoneNumber, email } = req.body;
        logger.info(JSON.stringify(phoneNumber, email));

        // Business logic
        let iauResponse = await identifyAndUpdate(phoneNumber, email, new Date().toISOString());
        console.log(iauResponse);
        const iau = iauResponse ? true : false;

        const DB = new Database();
        console.log(`INSERT INTO Contact (phoneNumber, email, linkedId, linkPrecedence, createdAt, updatedAt) VALUES ("${phoneNumber}", "${email}", ${iauResponse ? iauResponse.primaryContactId : null}, "${iauResponse ? "secondary" : "primary"}", NOW(), NOW());`);
        const insertQuery = await DB.query(`INSERT INTO Contact (phoneNumber, email, linkedId, linkPrecedence, createdAt, updatedAt) VALUES ("${phoneNumber}", "${email}", ${iauResponse ? iauResponse.primaryContactId : null}, "${iauResponse ? "secondary" : "primary"}", NOW(), NOW());`);
        DB.close();

        if (!iau) iauResponse = {};
        
        // Primary Contact ID
        if (!iau) iauResponse.primaryContactId = insertQuery.insertId;

        console.log(iauResponse);
        // Email
        if (!iau)
            iauResponse.emails = [email];
        else
            iauResponse.emails.push(email);

        // Phone Number
        if (!iau)
            iauResponse.phoneNumbers = [phoneNumber];
        else
            iauResponse.phoneNumbers.push(phoneNumber);

        // Secondary Contact ID
        if (!iau)
            iauResponse.secondaryContactIds = [];
        else
            iauResponse.secondaryContactIds.push(insertQuery.insertId);

        // Return statement
        return res.status(200).json({
            "contact": {
                "primaryContactId": iauResponse.primaryContactId,
                "emails": [...(new Set(iauResponse.emails))],
                "phoneNumbers": [...(new Set(iauResponse.phoneNumbers))],
                "secondaryContactIds": [...(new Set(iauResponse.secondaryContactIds))]
            }
        });
    } catch (err) {
        logger.error(err.stack);
        return res.status(500).json({
            success: false,
            message: err
        });
    }
};

const test = async (req, res) => {
    try {
        const DB = new Database();
        const query = await DB.query(`SELECT createdAt FROM Contact;`);
        DB.close();
        console.log(query[0].createdAt);
        if (new Date().toISOString() > query[0].createdAt) {
            console.log("No");
        } else {
            console.log("Yes");
        }

        // Return statement
        return res.status(200).json({
            success: true
        });
    } catch (err) {
        logger.error(err.stack);
        return res.status(500).json({
            success: false,
            message: err
        });
    }
};

module.exports = {
    identify,
    test
};