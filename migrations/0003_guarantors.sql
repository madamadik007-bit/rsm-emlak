ALTER TABLE contracts ADD COLUMN guarantor_person_ids TEXT;
-- JSON array of additional guarantor person IDs. Existing guarantor_person_id is retained for compatibility.
