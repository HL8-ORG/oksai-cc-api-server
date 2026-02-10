import { JwtPayload } from '../interfaces/jwt-payload.interface';
import { LoginDto, RegisterDto, RefreshTokenDto, ForgotPasswordDto, ResetPasswordDto, VerifyEmailDto } from '../dto';
import { User } from '../entities/user.entity';

export interface LoginResponse {
	accessToken: string;
	refreshToken: string;
	user: {
		id: string;
		email: string;
		firstName: string;
		lastName: string;
		tenantId: string;
		role: string;
	};
}

export interface RefreshTokenResponse {
	accessToken: string;
	refreshToken: string;
}

export interface VerifyEmailResponse {
	success: boolean;
}
