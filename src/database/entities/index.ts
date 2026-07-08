import { Shelter } from './shelter.entity';
import { User } from './user.entity';
import { Person } from './person.entity';
import { Approach } from './approach.entity';
import { Referral } from './referral.entity';
import { ShelterStay } from './shelter-stay.entity';
import { AuditLog } from './audit-log.entity';
import { PartnerCompany } from './partner-company.entity';

export { Shelter, User, Person, Approach, Referral, ShelterStay, AuditLog, PartnerCompany };

export const ALL_ENTITIES = [
  Shelter,
  User,
  Person,
  Approach,
  Referral,
  ShelterStay,
  AuditLog,
  PartnerCompany,
];
