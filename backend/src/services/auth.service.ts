import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThan, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import { JwtService } from '@nestjs/jwt';
import { User } from '../models/user.model';
import { Role } from '../models/enums';
import { RegisterDto, LoginDto, ForgotPasswordDto, ResetPasswordDto } from '../dto/auth.dto';
import { CreateStaffDto } from '../dto/user.dto';
import { MailerService } from './mailer.service';

const RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private usersRepository: Repository<User>,
    private jwtService: JwtService,
    private mailerService: MailerService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.usersRepository.findOne({
      where: { email: dto.email },
    });
    if (existing) throw new ConflictException('Email is already registered');

    const hashed = await bcrypt.hash(dto.password, 10);
    const verificationToken = randomBytes(24).toString('hex');
    const user = this.usersRepository.create({
      ...dto,
      password: hashed,
      role: Role.CUSTOMER,
      emailVerificationToken: verificationToken,
    });
    const saved = await this.usersRepository.save(user);

    const verifyUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/verify-email?token=${verificationToken}`;
    this.mailerService.sendVerificationEmail(saved.email, verifyUrl).catch(() => undefined);

    return this.buildAuthResponse(saved);
  }

  async createStaff(dto: CreateStaffDto) {
    const existing = await this.usersRepository.findOne({
      where: { email: dto.email },
    });
    if (existing) throw new ConflictException('Email is already registered');

    const hashed = await bcrypt.hash(dto.password, 10);
    const user = this.usersRepository.create({
      ...dto,
      password: hashed,
      isEmailVerified: true, // staff accounts are created by an admin, trusted by default
    });
    const saved = await this.usersRepository.save(user);
    return this.sanitize(saved);
  }

  async login(dto: LoginDto) {
    const user = await this.usersRepository.findOne({
      where: { email: dto.email },
    });
    if (!user || !user.password) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const matches = await bcrypt.compare(dto.password, user.password);
    if (!matches) throw new UnauthorizedException('Invalid credentials');
    if (!user.isActive) throw new UnauthorizedException('Account disabled');

    return this.buildAuthResponse(user);
  }

  // Called from the Google OAuth callback after Passport verifies the profile.
  async loginOrRegisterWithGoogle(profile: { googleId: string; email: string; name: string }) {
    if (!profile.email) {
      throw new BadRequestException('Google account has no email');
    }

    let user = await this.usersRepository.findOne({ where: { googleId: profile.googleId } });
    if (!user) {
      user = await this.usersRepository.findOne({ where: { email: profile.email } });
    }

    if (!user) {
      user = this.usersRepository.create({
        name: profile.name || profile.email.split('@')[0],
        email: profile.email,
        googleId: profile.googleId,
        role: Role.CUSTOMER,
        isEmailVerified: true, // Google already verified this email
        password: null,
      });
      user = await this.usersRepository.save(user);
    } else if (!user.googleId) {
      // Link an existing password account to Google on first Google login.
      user.googleId = profile.googleId;
      user.isEmailVerified = true;
      user = await this.usersRepository.save(user);
    }

    if (!user.isActive) throw new UnauthorizedException('Account disabled');
    return this.buildAuthResponse(user);
  }

  async verifyEmail(token: string) {
    const user = await this.usersRepository.findOne({
      where: { emailVerificationToken: token },
    });
    if (!user) throw new BadRequestException('Invalid or expired verification link');

    user.isEmailVerified = true;
    user.emailVerificationToken = null;
    await this.usersRepository.save(user);
    return { message: 'Email verified successfully.' };
  }

  async resendVerification(userId: string) {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) throw new BadRequestException('User not found');
    if (user.isEmailVerified) {
      return { message: 'Your email is already verified.' };
    }

    const token = randomBytes(24).toString('hex');
    user.emailVerificationToken = token;
    await this.usersRepository.save(user);

    const verifyUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/verify-email?token=${token}`;
    await this.mailerService.sendVerificationEmail(user.email, verifyUrl);
    return { message: 'Verification email sent.' };
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.usersRepository.findOne({ where: { email: dto.email } });
    if (user) {
      const token = randomBytes(32).toString('hex');
      user.resetPasswordToken = token;
      user.resetPasswordExpiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MS);
      await this.usersRepository.save(user);

      const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/reset-password?token=${token}`;
      await this.mailerService.send(
        user.email,
        'Reset your password',
        `We received a request to reset your password. This link expires in 1 hour: ${resetUrl}\n\nIf you didn't request this, you can safely ignore this email.`,
      );
    }
    return { message: 'If an account exists for that email, a reset link has been sent.' };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const user = await this.usersRepository.findOne({
      where: {
        resetPasswordToken: dto.token,
        resetPasswordExpiresAt: MoreThan(new Date()),
      },
    });
    if (!user) {
      throw new UnauthorizedException('This reset link is invalid or has expired');
    }

    user.password = await bcrypt.hash(dto.newPassword, 10);
    user.resetPasswordToken = null;
    user.resetPasswordExpiresAt = null;
    await this.usersRepository.save(user);

    return { message: 'Password updated. You can now log in with your new password.' };
  }

  private buildAuthResponse(user: User) {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      tokenVersion: user.tokenVersion,
    };
    return {
      accessToken: this.jwtService.sign(payload),
      user: this.sanitize(user),
    };
  }

  private sanitize(user: User) {
    const { password, ...rest } = user;
    return rest;
  }
}
