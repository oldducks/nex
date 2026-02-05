import { Controller, Get, Body, Param, UseGuards, Request, Put, NotFoundException } from '@nestjs/common';
import { ProfilesService } from './profiles.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('profile')
export class ProfilesController {
  constructor(private readonly profilesService: ProfilesService) { }

  // IMPORTANT: Static routes must come BEFORE parameterized routes
  @UseGuards(JwtAuthGuard)
  @Get('me')
  getMyProfile(@Request() req) {
    return this.profilesService.findByUserId(req.user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Put('me')
  update(@Request() req, @Body() updateProfileDto: UpdateProfileDto) {
    return this.profilesService.update(req.user.sub, updateProfileDto);
  }

  // Parameterized route comes LAST
  @Get(':uid')
  async findOne(@Param('uid') uid: string) {
    const profile = await this.profilesService.findOneByUid(uid);
    if (!profile) {
      throw new NotFoundException('Profile not found');
    }
    return profile;
  }
}
