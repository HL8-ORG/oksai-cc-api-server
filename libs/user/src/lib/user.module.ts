import { MikroOrmModule } from '@mikro-orm/nestjs';
import { OksaisPlugin } from '@oksai/plugin';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { User } from './entities/user.entity';

@OksaisPlugin({
	imports: [MikroOrmModule.forFeature([User])],
	controllers: [UserController],
	providers: [UserService],
	exports: [UserService]
})
export class UserModule {}
