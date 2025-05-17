import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthorModule } from './author/author.module';
import { BookModule } from './book/book.module';
import { CacheModule } from '@nestjs/cache-manager';

@Module({
  imports: [
    PrismaModule,
    AuthorModule,
    BookModule,
    CacheModule.register({
      ttl: 60,
      max: 100, 
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
