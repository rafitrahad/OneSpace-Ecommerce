import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { User } from '../models/user.model';
import { AuthService } from '../services/auth.service';
import { AuthController } from '../controllers/auth.controller';
import { JwtStrategy } from '../services/jwt.strategy';
import { GoogleStrategy } from '../services/google.strategy';
import { MailerService } from '../services/mailer.service';
import { UsersModule } from './users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    PassportModule,
    UsersModule,
    // registerAsync + ConfigService guarantees .env has already been loaded
    // by the time this factory runs. The previous synchronous
    // JwtModule.register({ secret: process.env.JWT_SECRET }) read
    // process.env at import time - before dotenv had populated it - so it
    // silently signed tokens with the fallback secret while JwtStrategy
    // (instantiated later) verified against the real one. Mismatched
    // secrets = every token fails signature verification = permanent 401s.
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET') || 'change_this_super_secret_key',
        signOptions: { expiresIn: config.get<string>('JWT_EXPIRES_IN') || '7d' },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, GoogleStrategy, MailerService],
  exports: [AuthService],
})
export class AuthModule {}