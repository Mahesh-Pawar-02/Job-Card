// Schema definition for party_master table
const partyMasterSchema = {
  party_name: 'VARCHAR(100)',
  party_type: 'VARCHAR(50)',
  vendor_code: 'VARCHAR(50)',
  address: 'VARCHAR(255)',
  telephone_nos: 'VARCHAR(50)',
  email: 'VARCHAR(100)',
  contact_person: 'VARCHAR(100)',
  legal_name: 'VARCHAR(100)',
  trade_name: 'VARCHAR(100)',
  pan: 'VARCHAR(20)',
  tcs_applicable: 'CHAR(1)',
  trans_catg: 'VARCHAR(20)',
  gstin: 'VARCHAR(20)',
  state: 'VARCHAR(50)',
  ac_ledger_name: 'VARCHAR(100)',
  place: 'VARCHAR(100)',
  pin: 'VARCHAR(10)',
  distance_km: 'INT',
  country_code: 'VARCHAR(10)',
  port_code: 'VARCHAR(10)',
  currency_code: 'VARCHAR(10)',
  ledger_name_tally: 'VARCHAR(100)'
};

module.exports = partyMasterSchema;