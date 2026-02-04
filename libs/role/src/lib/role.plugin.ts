import { IOksaisPluginBootstrap, OksaisPlugin } from '@oksai/plugin';
import { RoleModule } from './role.module';
import { Role } from './entities/role.entity';
import { Permission } from './entities/permission.entity';

@OksaisPlugin({
	imports: [RoleModule],
	entities: [Role, Permission],
	configuration: () => ({
		name: 'Role',
		description: 'Role and permission management plugin',
		version: '0.1.0',
		author: 'OKSAI'
	})
})
export class RolePlugin implements IOksaisPluginBootstrap {
	async onPluginBootstrap(): Promise<void> {
		console.log('Role plugin bootstrapped');
	}

	async onPluginDestroy(): Promise<void> {
		console.log('Role plugin destroyed');
	}
}
