import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../models/user.model';
import { UpdateUserDto, UpdateUserRoleDto, ChangePasswordDto } from '../dto/user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private usersRepository: Repository<User>,
  ) {}

  async findAll() {
    const users = await this.usersRepository.find({ order: { createdAt: 'DESC' } });
    return users.map(({ password, ...rest }) => rest);
  }

  async findOne(id: string) {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    const { password, ...rest } = user;
    return rest;
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

    const matches = await bcrypt.compare(dto.currentPassword, user.password);
    if (!matches) throw new UnauthorizedException('Current password is incorrect');

    if (dto.currentPassword === dto.newPassword) {
      throw new BadRequestException('New password must be different from the current password');
    }

    user.password = await bcrypt.hash(dto.newPassword, 10);
    await this.usersRepository.save(user);
    return { message: 'Password updated successfully.' };
  }
}