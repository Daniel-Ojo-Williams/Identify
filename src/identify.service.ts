import type { Request, Response } from 'express';
import AppDatasource from './db/datasource';
import { Contact } from './db/entities/contact.entity';
import { In } from 'typeorm';
const contactRepo = AppDatasource.getRepository(Contact);

type IdentifyResponse = {
  primaryContactId: number;
  emails: string[];
  phoneNumbers: string[];
  secondaryContactIds: number[];
}

export const identify = async (email?: string, phoneNumber?: string): Promise<IdentifyResponse> => {
  const contacts: Contact[] = await contactRepo.query(
    `
    WITH RECURSIVE ct AS (
      SELECT * FROM "Contact"
      WHERE email = $1 OR "phoneNumber" = $2

      UNION

      SELECT c.*
      FROM ct
      INNER JOIN "Contact" c ON c."linkedId" = ct.id OR ct."linkedId" = c.id
    )
    SELECT * FROM ct`, [email, phoneNumber]
  );

  if (contacts.length === 0) {
    // Create a new contact with email and phoneNumber
    await contactRepo.save({ linkPrecedence: 'primary', email, phoneNumber });
  } else {
    if (email && phoneNumber) {
      // Check if there is more than one primary
      let primaryCount = 0;
      contacts.forEach(contact => {
        contact.linkPrecedence === 'primary' && primaryCount++
      })
      // Retrieve the oldest contact (primary)
      const primaryContact = contacts.reduce((a, b) => (new Date(a.createdAt) < new Date(b.createdAt) ? a : b))
      if (primaryCount > 1) {
        // Convert this to secondary
        const convertToSecondary = contacts.filter(contact => contact.id !== primaryContact.id && contact.linkPrecedence === 'primary')
        await contactRepo.update({ id: In(convertToSecondary.map(contact => contact.id)) }, 
        { linkPrecedence: 'secondary', linkedId: primaryContact.id, updatedAt: new Date().toISOString() });
      }
      // Link every secondary contact to the same primary contact
      const unlinkedSecondaries = contacts.filter(contact => contact.id !== primaryContact.id && contact.linkedId !== primaryContact.id)
      if (unlinkedSecondaries.length) {
        await contactRepo.update({ id: In(unlinkedSecondaries.map(contact => contact.id)) }, { linkedId: primaryContact.id, updatedAt: new Date().toISOString() })
      }

      // If both email and phoneNumber are sent, check if either is not registered yet
     const emailExists = contacts.some(contact => contact.email === email)
     const phoneNumberExists = contacts.some(contact => contact.phoneNumber === phoneNumber)

      // If either is not registered yet, register it  
      if (!emailExists || !phoneNumberExists) {
        await contactRepo.save({ linkPrecedence: 'secondary', email, phoneNumber, linkedId: primaryContact.id });
      }
    }
  }

  const cont: IdentifyResponse[] = await contactRepo.query(
      `
       WITH RECURSIVE ct AS (
      SELECT * FROM "Contact"
      WHERE email = $1 OR "phoneNumber" = $2

      UNION

      SELECT c.*
      FROM ct
      INNER JOIN "Contact" c ON c."linkedId" = ct.id OR ct."linkedId" = c.id
      )
      SELECT  
      MAX(CASE WHEN "linkPrecedence" = 'primary' THEN id END) AS "primaryContactId",
      json_agg(email ORDER BY "createdAt") as "emails",
      (SELECT COALESCE(json_agg(DISTINCT "phoneNumber"), '[]') FROM (SELECT "phoneNumber", "createdAt" FROM ct ORDER BY "createdAt")) AS "phoneNumbers",
      COALESCE(json_agg(id ORDER BY "createdAt") FILTER (WHERE "linkPrecedence" <> 'primary'), '[]') AS "secondaryContactIds"
      FROM ct`,
    [email, phoneNumber]
  );

  return cont[0];
}