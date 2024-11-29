import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import {
  AppLoggerMiddleware,
  DatesErrorsInterceptor,
  IsUniqueInterceptor,
  NotFoundInterceptor,
  RolesGuard,
} from './common';
import { CronModule } from './cron/cron.module';
import { configuration, configValidationSchema } from './database/config';
import { LinksModule } from './links/links.module';
import { MemesModule } from './memes/memes.module';
import { NotificationSettingsController } from './notification-settings/notification-settings.controller';
import { NotificationSettingsModule } from './notification-settings/notification-settings.module';
import { ReasonsModule } from './reasons/reasons.module';
import { SessionModule } from './session/session.module';
import { SubTaskModule } from './sub-tasks/sub-tasks.module';
import { SubscriptionModule } from './subscription/subscription.module';
import { TagsModule } from './tags/tags.module';
import { TaskImagesModule } from './task-images/task-images.module';
import { TaskRemindModule } from './task-remind/task-remind.module';
import { TasksModule } from './tasks/tasks.module';
import { TutorialLinksModule } from './tutorial-links/tutorial-links.module';
import { UserBalanceModule } from './user-balance/user-balance.module';
import { UsersModule } from './users/users.module';
import { WebPushModule } from './web-push/web-push.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: configValidationSchema,
      load: [configuration],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('database.host'),
        port: configService.get('database.port'),
        username: configService.get('database.username'),
        password: configService.get('database.password'),
        database: configService.get('database.name'),
        entities: [join(__dirname, '**', '*.entity.{ts,js}')],
        synchronize: true,
        ssl: {
          rejectUnauthorized: true,
        },
        extra: {
          max: configService.get('database.poolMax'),
          idleTimeoutMillis: configService.get('database.poolTimeout'),
        },
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    UsersModule,
    TasksModule,
    UserBalanceModule,
    TagsModule,
    SubTaskModule,
    LinksModule,
    ReasonsModule,
    TaskRemindModule,
    MemesModule,
    CloudinaryModule,
    NotificationSettingsModule,
    WebPushModule,
    SubscriptionModule,
    TutorialLinksModule,
    SessionModule,
    TaskImagesModule,
    CronModule,
  ],
  controllers: [AppController, NotificationSettingsController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },

    { provide: APP_INTERCEPTOR, useClass: DatesErrorsInterceptor },
    {
      provide: APP_INTERCEPTOR,
      useClass: NotFoundInterceptor,
    },
    { provide: APP_INTERCEPTOR, useClass: IsUniqueInterceptor },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AppLoggerMiddleware).forRoutes('*');
  }
}
