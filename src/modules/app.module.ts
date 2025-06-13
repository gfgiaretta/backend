import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from '../auth/auth.guard';
import { AuthModule } from './auth.module';
import { BoilerplateModule } from './boilerplate.module';
import { UserModule } from 'src/modules/user.module';
import { LibraryModule } from './library.module';
import { ExerciseModule } from './exercise.module';
import { PostModule } from './post.module';
import { PresignedModule } from './presigned.module';
import { CommentModule } from './comment.module';

@Module({
  imports: [
    AuthModule,
    BoilerplateModule,
    ExerciseModule,
    LibraryModule,
    UserModule,
    PostModule,
    PresignedModule,
    CommentModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class AppModule {}
