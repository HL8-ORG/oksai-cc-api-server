import { IOksaisPluginBootstrap, OksaisPlugin } from '@oksai/plugin';
import { OrganizationModule } from './organization.module';
import { Organization } from './entities/organization.entity';

@OksaisPlugin({
	imports: [OrganizationModule],
	entities: [Organization],
	configuration: () => ({
		name: 'Organization',
		description: 'Organization management plugin',
		version: '0.1.0',
		author: 'OKSAI'
	})
})
export class OrganizationPlugin implements IOksaisPluginBootstrap {
	async onPluginBootstrap(): Promise<void> {
		console.log('Organization plugin bootstrapped');
	}

	async onPluginDestroy(): Promise<void> {
		console.log('Organization plugin destroyed');
	}
}
