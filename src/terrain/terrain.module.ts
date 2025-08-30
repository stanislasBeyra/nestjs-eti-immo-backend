import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { TerrainService } from './terrain.service';
import { TerrainController } from './terrain.controller';
import { Terrain } from './entities/terrain.entity';
import { AgenceModule } from '../agence/agence.module';
import { diskStorage } from 'multer';
import { extname, join } from 'path';

@Module({
  imports: [
    TypeOrmModule.forFeature([Terrain]),
    MulterModule.register({
      storage: diskStorage({
        destination: join(process.cwd(), 'public', 'uploads', 'terrain'),
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
          const ext = extname(file.originalname);
          const filename = `terrain-${uniqueSuffix}${ext}`;
          cb(null, filename);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
          cb(null, true);
        } else {
          cb(new Error('Seules les images sont autorisées (jpg, jpeg, png, gif, webp)'), false);
        }
      },
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB max
      },
    }),
    AgenceModule
  ],
  controllers: [TerrainController],
  providers: [TerrainService],
  exports: [TerrainService],
})
export class TerrainModule {}