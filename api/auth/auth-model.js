const db = require('../../data/dbConfig');


module.exports = {
    insert: async (user) => {
        const [id] = await db('users').insert(user);
        return db('users').where({id}).first();
    },

    findBy: (filter) => {
        return db('users').where(filter).first();
    }
}