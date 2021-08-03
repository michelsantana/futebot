const connection = require('./conn');
const crypto = require('crypto');

const Repository = (entity) => {
   const _entity = entity;
   return {
      async All() {
         const data = await connection(_entity).select('*');
         return data;
      },
      async Find(id) {
         const data = await connection(_entity).where('id', id).select('*');
         return data;
      },
      async Query(where) {
         const data = await connection(_entity).where(where).select('*');
         return data;
      },
      async First(where) {
         const data = await connection(_entity).where(where).select('*').first();
         return data;
      },
      async Add(data) {
         const id = crypto.randomBytes(4).toString('HEX');
         if (!data.id) data.id = id;
         await connection(_entity).insert(data);
         return data;
      },
      async Update(id, data) {
         await connection(_entity).update(data).where({ id: id });
      },
      async Delete(id) {
         await connection(_entity).where('id', id).delete();
      }
   };
};

module.exports = Repository;
