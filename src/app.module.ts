import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ConnectionOptions } from 'typeorm'

import { UsersModule } from './users/users.module'
import { User } from './users/user.entity'

import { AppController } from './app.controller'
import { AppService } from './app.service'

const ormconfig: ConnectionOptions = {
  type: 'sqlite',
  database: `${__dirname}/data.sqlite`,
  entities: [User],
  logging: true,
}

@Module({
  imports: [TypeOrmModule.forRoot(ormconfig), UsersModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
