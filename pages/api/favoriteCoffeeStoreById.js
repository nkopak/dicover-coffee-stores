import { findRecordByFilter, getRecords, table } from '../../lib/airtable';

const favoriteCoffeeStoreById = async (req, res) => {
  if (req.method === 'PUT'){
    try {
      const {id} = req.body;

      if (id) {
        const records = await findRecordByFilter(id);

        if (records.length !== 0) {
          const record = records[0];

          const calculateVoting = parseInt(record.voting, 10) + parseInt(1, 10);

          const updateRecord = await table.update([
            {
              id: record.recordId,
              fields: {
                voting: calculateVoting
              }
            }
          ]);

          if (updateRecord){
            const records = getRecords(updateRecord);
            res.json(records);
          }
        } else {
          res.json({message: `Coffee store id doesn't exist: ${id}`});
        }
      } else {
        res.status(400);
        res.json({message: 'Id is missing'});
      }

      res.json({message: `This works ${id}`});
    } catch (error) {
      res.status(500);
      res.json({message: `Error upvoting coffee store: ${error}`});
    }
  }
};

export default favoriteCoffeeStoreById;
