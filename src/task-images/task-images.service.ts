import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, In, Repository } from 'typeorm';

import { CloudinaryService } from '@/cloudinary/cloudinary.service';
import { publicIdExtract } from '@/common';

import { TaskImage } from './entities/task-image.entity';

@Injectable()
export class TaskImagesService {
  constructor(
    @InjectRepository(TaskImage)
    private readonly taskImageRepository: Repository<TaskImage>,
    readonly cloudinaryService: CloudinaryService,
  ) {}

  async createForNewTask(
    payload: Express.Multer.File[],
    manager: EntityManager,
  ) {
    const uploadImages = await Promise.all(
      payload.map(async (p) => {
        const { secure_url, public_id } =
          await this.cloudinaryService.uploadFile(p);
        return { secure_url, public_id };
      }),
    );

    const taskImages = await Promise.all(
      uploadImages.map(async ({ secure_url }) => {
        const newTaskImage = new TaskImage();
        newTaskImage.imageUrl = secure_url;

        return await manager.save(newTaskImage);
      }),
    );

    return { taskImages, publicIds: uploadImages.map((ui) => ui.public_id) };
  }

  findAll() {
    return `This action returns all taskImages`;
  }

  async addTaskImages(payload: Express.Multer.File[]) {
    const secureUrls = await Promise.all(
      payload.map(async (p) => {
        const { secure_url } = await this.cloudinaryService.uploadFile(p);
        return secure_url;
      }),
    );

    const newTaskImages = await Promise.all(
      secureUrls.map(async (su) => {
        const newTaksImage = new TaskImage();
        newTaksImage.imageUrl = su;
        return await this.taskImageRepository.save(newTaksImage);
      }),
    );

    return newTaskImages;
  }

  async removeTaskImages(
    userId: number,
    taskId: number,
    taskImageIds: number[],
  ) {
    const existingTaskImages = await this.taskImageRepository.find({
      where: {
        id: In(taskImageIds),
        task: { id: taskId, user: { id: userId } },
      },
      select: ['id', 'imageUrl'],
    });

    if (!existingTaskImages.length) {
      throw new NotFoundException('Task images not found');
    }
    const urls = existingTaskImages.map((i) => i.imageUrl);

    const publicIds = urls.map((url) => publicIdExtract(url));

    await Promise.all(
      publicIds.map(async (id) => {
        await this.cloudinaryService.deleteFile(id);
      }),
    );
    await this.taskImageRepository.remove(existingTaskImages);
    return true;
  }
}
