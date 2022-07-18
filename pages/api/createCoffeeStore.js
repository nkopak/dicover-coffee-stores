import { findRecordByFilter, getRecords, table } from '../../lib/airtable';

const createCoffeeStore = async (req, res) => {
  if (req.method === 'POST'){
    const {id, name, neighbourhood, address, imgUrl, voting} = req.body;

    try {
      if (id){
        const records = await findRecordByFilter(id);

        if (records.length !== 0) {
          res.json(records);
        } else {
          if (name){
            const createRecords = await table.create([
              {
                fields: {
                  id,
                  name,
                  neighbourhood,
                  address,
                  voting,
                  imgUrl
                }
              }
            ]);

            const records = getRecords(createRecords);

            res.json(records);
          } else {
            res.status(400);
            res.json({message: 'Id or name is missing'});
          }
        }
      } else {
        res.status(400);
        res.json({message: 'Id is missing'});
      }

    } catch (error) {
      console.error('Error creating or finding store', error);
      res.status(500);
      res.json({message: 'Error creating or finding store', error});
    }
  }
};

export default createCoffeeStore;
