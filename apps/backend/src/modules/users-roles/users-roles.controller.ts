import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { UsersRolesService } from './users-roles.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermission } from '../auth/decorators/permissions.decorator';
import { CreateUserDto } from './dto/create-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

@Controller('users-roles')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class UsersRolesController {
  constructor(private readonly usersRolesService: UsersRolesService) {}

  @Post('users')
  @RequirePermission('users.create')
  async createUser(@Request() req: any, @Body() body: CreateUserDto) {
    return this.usersRolesService.createUser(body, req.user.sub);
  }

  @Get('users')
  async getAllUsers() {
    return this.usersRolesService.getAllUsers();
  }

  @Get('roles')
  async getAllRoles() {
    return this.usersRolesService.getAllRoles();
  }

  @Post('change-password')
  // Note: No RequirePermission here because any logged-in user can change their own password
  async changePassword(@Request() req: any, @Body() body: ChangePasswordDto) {
    await this.usersRolesService.changePassword(req.user.sub, body.newPassword);
    return { success: true, message: 'Mot de passe modifié avec succès. Sessions invalidées.' };
  }
}
