import {
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
    const user = this.usersRepository.create({
      ...dto,
      password: hashed,
      role: Role.CUSTOMER,
    });
    const saved = await this.usersRepository.save(user);
    return this.buildAuthResponse(saved);
  }

  // Admin-only: create staff (manager/admin) accounts
  async createStaff(dto: CreateStaffDto) {
    const existing = await this.usersRepository.findOne({
      where: { email: dto.email },
    });
    if (existing) throw new ConflictException('Email is already registered');

    const hashed = await bcrypt.hash(dto.password, 10);
    const user = this.usersRepository.create({ ...dto, password: hashed });
    const saved = await this.usersRepository.save(user);
    return this.sanitize(saved);
  }

  async login(dto: LoginDto) {
    const user = await this.usersRepository.findOne({
      where: { email: dto.email },
    });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const matches = await bcrypt.compare(dto.password, user.password);
    if (!matches) throw new UnauthorizedException('Invalid credentials');
    if (!user.isActive) throw new UnauthorizedException('Account disabled');

    return this.buildAuthResponse(user);
  }

  // Always responds the same way whether or not the email exists, so an
  // attacker can't use this endpoint to discover which emails are registered.
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
    const payload = { sub: user.id, email: user.email, role: user.role };
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