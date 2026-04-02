import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class ReferralMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    console.log('ReferralMiddleware: Processing request to:', req.path);
    
    // Store referral code in session if present in URL
    const referralCode = req.query.ref as string;
    
    if (referralCode && (req as any).session) {
      console.log('ReferralMiddleware: Storing referral code:', referralCode);
      (req as any).session.referralCode = referralCode;
      (req as any).session.save((err: any) => {
        if (err) {
          console.error('Failed to save session:', err);
        }
      });
    }
    
    next();
  }
}
