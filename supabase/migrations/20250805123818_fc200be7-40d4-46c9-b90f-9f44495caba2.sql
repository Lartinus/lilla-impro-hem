-- Rensa bort alla testbetalningar från course_purchases
-- Dessa verkar vara testbetalningar som inte resulterat i faktiska kursdeltagare
DELETE FROM course_purchases WHERE payment_status = 'paid';

-- Lägg till en kommentar i tabellen för framtida referens
COMMENT ON TABLE course_purchases IS 'Kursbetalningar - endast riktiga betalningar som resulterat i kursdeltagare ska finnas här';