import { CvController } from './cv.controller';
import { CvService } from './cv.service';

describe('CvController', () => {
  const cvService = {
    uploadCv: jest.fn(),
    getLatestCvByUser: jest.fn(),
    getCvsByUser: jest.fn(),
  };

  const controller = new CvController(cvService as unknown as CvService);

  it('upload delega al service', async () => {
    const file = { originalname: 'cv.pdf' } as Express.Multer.File;
    cvService.uploadCv.mockResolvedValue({ id: 1 });

    const result = await controller.upload(file, 1);

    expect(cvService.uploadCv).toHaveBeenCalledWith(file, 1);
    expect(result.message).toBe('CV subido correctamente');
  });

  it('getLatest delega al service', async () => {
    cvService.getLatestCvByUser.mockResolvedValue({ id: 1 });
    await expect(controller.getLatest(1)).resolves.toEqual({ id: 1 });
  });

  it('getByUser delega al service', async () => {
    cvService.getCvsByUser.mockResolvedValue([{ id: 1 }]);
    await expect(controller.getByUser(1)).resolves.toHaveLength(1);
  });
});