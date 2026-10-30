ALTER TABLE people ADD COLUMN roles TEXT;
ALTER TABLE people ADD COLUMN spouse_person_id TEXT REFERENCES people(id) ON DELETE RESTRICT;
-- Roles stored as JSON array: landlord, tenant, guarantor, spouse.
