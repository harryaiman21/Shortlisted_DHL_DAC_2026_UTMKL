import { Test, TestingModule } from '@nestjs/testing';
import { UsersAdminService } from './users-admin.service';

describe('UsersAdminService', () => {
  let service: UsersAdminService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersAdminService],
    }).compile();

    service = module.get<UsersAdminService>(UsersAdminService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
