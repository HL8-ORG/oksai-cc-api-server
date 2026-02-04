import { defineConfig } from '@mikro-orm/postgresql';
import { User } from '@oksai/auth';
import { Tenant } from '@oksai/tenant';
import { Organization } from '@oksai/organization';
import { Role } from '@oksai/role';
import { Permission } from '@oksai/role';
import { AuditLog } from '@oksai/audit';

export default defineConfig({
	entities: [User, Tenant, Organization, Role, Permission, AuditLog],
	dbName: process.env.DATABASE_NAME || 'gauzy',
	host: process.env.DATABASE_HOST || 'localhost',
	port: Number(process.env.DATABASE_PORT) || 5432,
	user: process.env.DATABASE_USERNAME || 'postgres',
	password: process.env.DATABASE_PASSWORD || 'gauzy_password',
	allowGlobalContext: true,
	debug: process.env.NODE_ENV === 'development'
});
