const Airtable = require('airtable');
export const base = new Airtable({apiKey: process.env.AIRTABLE_API_KEY}).base(process.env.AIRTABLE_BASE_KEY);

const table = base('coffee-stores');

const getRecord = (record) => {
  return {
    recordId: record.id,
    ...record.fields
  };
};

const getRecords = (records) => {
  return records.map((r)=> getRecord(r));
};

const findRecordByFilter = async (id) => {
  const records = await table.select({
    filterByFormula: `id="${id}"`
  }).firstPage();

  return getRecords(records);

};

export {table, getRecords, findRecordByFilter};

