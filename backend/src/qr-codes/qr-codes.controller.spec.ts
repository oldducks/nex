import { BadRequestException } from '@nestjs/common';
import { QrCodesPublicController } from './qr-codes.controller';
import { QrCodesService } from './qr-codes.service';

describe('QrCodesPublicController', () => {
  let controller: QrCodesPublicController;
  let service: {
    getPublicQrData: jest.Mock;
    buildQrDataUrl: jest.Mock;
  };

  beforeEach(() => {
    service = {
      getPublicQrData: jest.fn(),
      buildQrDataUrl: jest.fn(),
    };

    controller = new QrCodesPublicController(service as unknown as QrCodesService);
  });

  const makeRes = () => ({
    setHeader: jest.fn(),
    redirect: jest.fn(),
  });

  it('should throw when format is invalid', async () => {
    const res = makeRes();

    await expect(
      controller.download('1', res as any, undefined, 'gif' as any, undefined, undefined),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('should throw when size is invalid', async () => {
    const res = makeRes();

    await expect(
      controller.download('1', res as any, undefined, 'png', 'xlarge', undefined),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('should redirect inline with computed image url', async () => {
    const res = makeRes();
    service.getPublicQrData.mockResolvedValue({
      id: 10,
      size: 'medium',
      target_url: 'https://example.com',
    });
    service.buildQrDataUrl.mockReturnValue('https://qr.example/image.svg');

    await controller.download(
      '10',
      res as any,
      '1',
      'svg',
      'large',
      { headers: { 'x-visitor-id': 'vid-1' }, ip: '127.0.0.1' } as any,
    );

    expect(service.getPublicQrData).toHaveBeenCalledWith(10, 'vid-1');
    expect(service.buildQrDataUrl).toHaveBeenCalledWith('https://example.com', 'large', 'svg');
    expect(res.redirect).toHaveBeenCalledWith('https://qr.example/image.svg');
  });

  it('should set png headers and redirect for download mode', async () => {
    const res = makeRes();
    service.getPublicQrData.mockResolvedValue({
      id: 7,
      size: 'small',
      target_url: 'https://example.com/a',
    });
    service.buildQrDataUrl.mockReturnValue('https://qr.example/image.png');

    await controller.download('7', res as any, undefined, 'png', undefined, { ip: '10.0.0.1' } as any);

    expect(service.getPublicQrData).toHaveBeenCalledWith(7, '10.0.0.1');
    expect(service.buildQrDataUrl).toHaveBeenCalledWith('https://example.com/a', 'small', 'png');
    expect(res.setHeader).toHaveBeenCalledWith('Content-Type', 'image/png');
    expect(res.setHeader).toHaveBeenCalledWith('Content-Disposition', 'attachment; filename="qr_7.png"');
    expect(res.redirect).toHaveBeenCalledWith('https://qr.example/image.png');
  });

  it('should set svg content type when format is svg', async () => {
    const res = makeRes();
    service.getPublicQrData.mockResolvedValue({
      id: 8,
      size: 'medium',
      target_url: 'https://example.com/b',
    });
    service.buildQrDataUrl.mockReturnValue('https://qr.example/image.svg');

    await controller.download('8', res as any, undefined, 'svg', undefined, { ip: '10.0.0.2' } as any);

    expect(res.setHeader).toHaveBeenCalledWith('Content-Type', 'image/svg+xml');
    expect(res.setHeader).toHaveBeenCalledWith('Content-Disposition', 'attachment; filename="qr_8.svg"');
    expect(res.redirect).toHaveBeenCalledWith('https://qr.example/image.svg');
  });
});
