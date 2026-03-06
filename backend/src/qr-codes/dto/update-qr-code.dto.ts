import { PartialType } from '@nestjs/mapped-types';
import { CreateQrCodeDto } from './create-qr-code.dto';

// 更新 QRCode 时的 DTO：全部字段可选
export class UpdateQrCodeDto extends PartialType(CreateQrCodeDto) {}

