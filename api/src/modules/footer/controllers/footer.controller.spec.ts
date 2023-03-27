import { Test, TestingModule } from '@nestjs/testing';
import { FooterController } from './footer.controller';

describe('FooterController', () => {
  let controller: FooterController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FooterController],
    }).compile();

    controller = module.get<FooterController>(FooterController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
