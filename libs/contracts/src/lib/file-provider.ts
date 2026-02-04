/**
 * 文件存储选项配置
 */

export interface FileStorageOption {
	/** 文件存储的目标路径或函数 */
	dest: string | CallableFunction;
	/** 文件存储提供者 */
	provider?: FileStorageProvider;
	/** 文件路径前缀 */
	prefix?: string;
	/** 文件名或文件名生成函数 */
	filename?: string | CallableFunction;
}

/**
 * 文件系统配置
 */
export interface FileSystem {
	/** 文件系统的根路径 */
	rootPath: string;
	/** 文件系统的基础 URL（可选） */
	baseUrl?: string;
}

/**
 * 文件存储提供者枚举
 *
 * 定义支持的文件存储服务提供商
 */
export enum FileStorageProviderEnum {
	/** 本地文件系统存储 */
	LOCAL = 'LOCAL',
	/** Amazon S3 存储 */
	S3 = 'S3',
	/** Wasabi 存储服务 */
	WASABI = 'WASABI',
	/** Cloudinary 存储服务 */
	CLOUDINARY = 'CLOUDINARY',
	/** DigitalOcean Spaces 存储 */
	DIGITALOCEAN = 'DIGITALOCEAN'
}

/**
 * 文件存储提供者类型
 *
 * 从 FileStorageProviderEnum 派生，并包含调试选项
 */
export type FileStorageProvider = keyof typeof FileStorageProviderEnum | 'DEBUG';

/**
 * 已上传文件信息
 */
export interface UploadedFile {
	/** 表单字段名称 */
	fieldname: string;
	/** 文件在存储中的路径（键） */
	key: string;
	/** 原始文件名 */
	originalname: string;
	/** 文件大小（字节） */
	size: number;
	/** 文件编码（可选） */
	encoding?: string;
	/** 文件的 MIME 类型（可选） */
	mimetype?: string;
	/** 文件名 */
	filename: string;
	/** 文件公共访问 URL */
	url: string;
	/** 文件完整路径 */
	path: string;
}

/**
 * AWS S3 文件存储提供者配置
 */
export interface IS3FileStorageProviderConfig {
	/** AWS 访问密钥 ID */
	aws_access_key_id?: string;
	/** AWS 访问密钥 */
	aws_secret_access_key?: string;
	/** AWS 默认区域 */
	aws_default_region?: string;
	/** AWS S3 存储桶名称 */
	aws_bucket?: string;
	/** AWS S3 强制路径样式 */
	aws_force_path_style?: boolean;
}

/**
 * Wasabi 文件存储提供者配置
 */
export interface IWasabiFileStorageProviderConfig {
	/** Wasabi AWS 访问密钥 ID */
	wasabi_aws_access_key_id?: string;
	/** Wasabi AWS 访问密钥 */
	wasabi_aws_secret_access_key?: string;
	/** Wasabi AWS 默认区域 */
	wasabi_aws_default_region?: string;
	/** Wasabi AWS 服务 URL */
	wasabi_aws_service_url?: string;
	/** Wasabi AWS 存储桶名称 */
	wasabi_aws_bucket?: string;
	/** Wasabi AWS 强制路径样式 */
	wasabi_aws_force_path_style?: boolean;
}

/**
 * Cloudinary 文件存储提供者配置
 */
export interface ICloudinaryFileStorageProviderConfig {
	/** Cloudinary 云名称 */
	cloudinary_cloud_name?: string;
	/** Cloudinary API 密钥 */
	cloudinary_api_key?: string;
	/** Cloudinary API 密钥 */
	cloudinary_api_secret?: string;
}

/**
 * DigitalOcean Spaces 文件存储提供者配置
 */
export interface IDigitalOceanFileStorageProviderConfig {
	/** DigitalOcean 访问密钥 ID */
	digitalocean_access_key_id?: string;
	/** DigitalOcean 访问密钥 */
	digitalocean_secret_access_key?: string;
	/** DigitalOcean 默认区域 */
	digitalocean_default_region?: string;
	/** DigitalOcean 服务 URL */
	digitalocean_service_url?: string;
	/** DigitalOcean CDN URL */
	digitalocean_cdn_url?: string;
	/** DigitalOcean S3 存储桶名称 */
	digitalocean_s3_bucket?: string;
	/** DigitalOcean S3 强制路径样式 */
	digitalocean_s3_force_path_style?: boolean;
}
