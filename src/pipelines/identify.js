const logger = require('../services/logger');
const Database = require('../services/db');
const { getLinkedContacts } = require('../helper/contact');

const identifyAndUpdate = async (phoneNumber, email, primaryContactCreatedAt, response) => {
    try {
        const responsePrototype = {
            "primaryContactId": null,
            "emails": [],
            "phoneNumbers": [],
            "secondaryContactIds": []
        };
        const data = await getLinkedContacts(phoneNumber, email);
        if (!data.length)
            return null;
        responsePrototype.primaryContactId = data[0].id;
        for(let i=0; i<data.length; i++) {
            if (data.length && data[i].email) responsePrototype.emails.push(data[i].email);
            if (data.length && data[i].phoneNumber) responsePrototype.phoneNumbers.push(data[i].phoneNumber);
            if (data.length && data[i].id && i !== 0) responsePrototype.secondaryContactIds.push(data[i].id);
        }

        return responsePrototype;
    } catch (err) {
        logger.error(err.stack);
    }
};

// const identifyAndUpdate = async (phoneNumber, email, primaryContactCreatedAt, response) => {
//     try {
//         if(!response) response = responsePrototype;

//         const linkedContacts = await getLinkedContacts(id, phoneNumber, email, createdAt);
//         // id, email, phoneNumber, linkedId, linkedPresidence, createdAt

//         let primaryContactCreatedAt = new Date().toISOString();
//         for(let i=0; i<linkedContacts.length; i++) {
//             // Secondry account
//             if(linkedContacts[i].linkedId) {
//                 // Code
//             } else { // Primary account
//                 if( linkedContacts[i].createdAt < primaryContactCreatedAt ) {
//                     responsePrototype.primaryContactId = linkedContacts[i].id;
//                    if (email) responsePrototype.emails.push(email);
//                    if (phoneNumber) responsePrototype.phoneNumbers.push(phoneNumber);
//                    secondaryContactIds
//                 }
//             }
//         }
//         return {
//             "primaryContactId": 1,
//             "emails": ["lorraine@hillvalley.edu","mcfly@hillvalley.edu"],
//             "phoneNumbers": ["123456"],
//             "secondaryContactIds": [23]
//         };
//     } catch (err) {
//         logger.error(err.stash);
//     }
// };

module.exports = {
    identifyAndUpdate
};