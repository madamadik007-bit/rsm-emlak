PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS people (
  id TEXT PRIMARY KEY,
  owner_email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  national_id TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(id, owner_email)
);
CREATE INDEX IF NOT EXISTS people_owner_idx ON people(owner_email);

CREATE TABLE IF NOT EXISTS properties (
  id TEXT PRIMARY KEY,
  owner_email TEXT NOT NULL,
  title TEXT NOT NULL,
  property_type TEXT,
  province TEXT,
  district TEXT,
  address TEXT,
  block_no TEXT,
  parcel_no TEXT,
  independent_section TEXT,
  owner_person_id TEXT,
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(id, owner_email),
  FOREIGN KEY(owner_person_id, owner_email) REFERENCES people(id, owner_email) ON DELETE RESTRICT
);
CREATE INDEX IF NOT EXISTS properties_owner_idx ON properties(owner_email);

CREATE TABLE IF NOT EXISTS contracts (
  id TEXT PRIMARY KEY,
  owner_email TEXT NOT NULL,
  title TEXT NOT NULL,
  contract_type TEXT NOT NULL,
  property_id TEXT,
  lessor_person_id TEXT,
  tenant_person_id TEXT,
  guarantor_person_id TEXT,
  signing_date TEXT,
  rent_start_date TEXT,
  end_date TEXT,
  eviction_undertaking_date TEXT,
  monthly_rent REAL,
  deposit_amount REAL,
  advance_amount REAL,
  key_delivery_date TEXT,
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(id, owner_email),
  FOREIGN KEY(property_id, owner_email) REFERENCES properties(id, owner_email) ON DELETE RESTRICT,
  FOREIGN KEY(lessor_person_id, owner_email) REFERENCES people(id, owner_email) ON DELETE RESTRICT,
  FOREIGN KEY(tenant_person_id, owner_email) REFERENCES people(id, owner_email) ON DELETE RESTRICT,
  FOREIGN KEY(guarantor_person_id, owner_email) REFERENCES people(id, owner_email) ON DELETE RESTRICT
);
CREATE INDEX IF NOT EXISTS contracts_owner_idx ON contracts(owner_email);
