import { Injectable } from '@nestjs/common'

import { UsersService } from './users/users.service'

@Injectable()
export class AppService {
  constructor(private usersService: UsersService) {}

  async getHello(): Promise<string> {
    const users = await this.usersService.getUsers()
    return `Hello ${users.length} users!`
  }
}
