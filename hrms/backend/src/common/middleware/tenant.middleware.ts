import type { NextFunction, Request, Response } from 'express';
import { prisma } from '../../config/prisma.js';
import { sendError } from '../utils/api-response.js';

const getSubdomain = (host: string): string | null => {
  const parts = host.split('.');
  if (parts.length < 3) {
    return null;
  }
  return parts[0] ?? null;
};

export const resolveTenant = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const explicitSlug =
    (req.headers['x-org-slug'] as string | undefined) ??
    (req.query.orgSlug as string | undefined) ??
    (typeof req.body?.orgSlug === 'string' ? req.body.orgSlug : undefined);

  const host = req.headers.host;
  const subdomain = host ? getSubdomain(host) : null;
  const orgSlug = explicitSlug ?? subdomain;

  if (!orgSlug) {
    sendError(res, 'Organization slug is required', 400);
    return;
  }

  const org = await prisma.organization.findUnique({
    where: { slug: orgSlug },
    select: { id: true, slug: true, status: true },
  });

  if (!org || org.status !== 'ACTIVE') {
    sendError(res, 'Organization is not active', 403);
    return;
  }

  req.tenant = { orgId: org.id, slug: org.slug };
  next();
};
