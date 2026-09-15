import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ActivityLog } from '../models/activity-log.model';
import { ActivityAction } from '../models/enums';

@Injectable()
export class ActivityLogService {
  constructor(
    @InjectRepository(ActivityLog)
    private logsRepository: Repository<ActivityLog>,
  ) {}

  // Fire-and-forget logging - never let a logging failure break the actual
  // operation it's recording.
  async record(params: {
    userId?: string;
    userName?: string;
    action: ActivityAction;
    entityType: string;
    entityId?: string;
    description?: string;
  }) {
    try {
      const log = this.logsRepository.create(params);
      await this.logsRepository.save(log);
    } catch {
      // swallow - logging must never break the primary request
    }
  }

  findAll(limit = 200) {
    return this.logsRepository.find({
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }
}
