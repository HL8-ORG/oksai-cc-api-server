/**
 * Plugin Metadata Constants
 *
 * Defines metadata keys used by plugin system.
 */
export const PLUGIN_METADATA = {
	/** Metadata key for plugin entities */
	ENTITIES: 'oksais:plugin:entities',

	/** Metadata key for plugin subscribers */
	SUBSCRIBERS: 'oksais:plugin:subscribers',

	/** Metadata key for plugin extensions */
	EXTENSIONS: 'oksais:plugin:extensions',

	/** Metadata key for plugin configuration */
	CONFIGURATION: 'oksais:plugin:configuration',

	/** Metadata key for plugin name */
	NAME: 'oksais:plugin:name'
} as const;
