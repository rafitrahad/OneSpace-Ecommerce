import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../models/user.model';
import { Role } from '../models/enums';
import { UpdateUserDto, UpdateUserRoleDto, ChangePasswordDto, UpdateThemeDto } from '../dto/user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private usersRepository: Repository<User>,
  ) {}

  async findAll() {
    const users = await this.usersRepository.find({
      order: { createdAt: 'DESC' },
    });
    return users.map(({ password, ...rest }) => rest);
  }

  async findOne(id: string) {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    const { password, ...rest } = user;
    return rest;
  }

  // Used internally (e.g. low-stock alerts) - not exposed via API.
  async findStaffEmails(): Promise<string[]> {
    const staff = await this.usersRepository.find({
      where: { role: In([Role.ADMIN, Role.MANAGER]), isActive: true },
    });
    return staff.map((u) => u.email);
  }

  async update(id: string, dto: UpdateUserDto) {
    await this.findOne(id);
    await this.usersRepository.update(id, dto);
    return this.findOne(id);
  }

  async updateRole(id: string, dto: UpdateUserRoleDto) {
    await this.findOne(id);
    await this.usersRepository.update(id, { role: dto.role });
    return this.findOne(id);
  }

  async toggleActive(id: string, isActive: boolean) {
    await this.findOne(id);
    await this.usersRepository.update(id, { isActive });
    return this.findOne(id);
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.usersRepository.delete(id);
    return { deleted: true };
  }

  // Logged-in user changes their own password, must prove they know the current one.
  async changePassword(id: string, dto: ChangePasswordDto) {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    if (!user.password) {
      throw new BadRequestException(
        'This account signed up with Google and has no password to change. Use "Forgot password" to set one.',
      );
    }

    const matches = await bcrypt.compare(dto.currentPassword, user.password);
    if (!matches) throw new UnauthorizedException('Current password is incorrect');

    if (dto.currentPassword === dto.newPassword) {
      throw new BadRequestException('New password must be different from the current password');
    }

    user.password = await bcrypt.hash(dto.newPassword, 10);
    await this.usersRepository.save(user);
    return { message: 'Password updated successfully.' };
  }

  // Invalidates every previously issued JWT for this user by bumping the
  // token version - old tokens fail JwtStrategy's version check afterward.
  async logoutAllDevices(id: string) {
    await this.usersRepository.increment({ id }, 'tokenVersion', 1);
    return { message: 'Logged out of all devices.' };
  }

  async updateTheme(id: string, dto: UpdateThemeDto) {
    await this.findOne(id);
    await this.usersRepository.update(id, { themePreference: dto.themePreference });
    return this.findOne(id);
  }
}
