import express, { Request, Response } from 'express';

import AuthnUtil from '../../utils/AuthnUtil';

const router = express.Router();

router.get('/whoami', async (req: Request, res: Response) => {
  const result = await AuthnUtil.getCurrentUser(req);

  if (result === false) {
    res.json({ authenticated: false });
    return;
  }

  res.json({
    authenticated: true,
    user: result,
  });
});

export default router;
