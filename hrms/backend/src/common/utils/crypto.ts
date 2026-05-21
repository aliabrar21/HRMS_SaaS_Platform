import crypto from 'node:crypto';

const algorithm = 'aes-256-cbc';

const deriveKey = (): Buffer => {
  const seed = process.env.JWT_ACCESS_SECRET ?? 'change_me_access';
  return crypto.createHash('sha256').update(seed).digest();
};

export const encryptText = (plainText: string): string => {
  const iv = crypto.randomBytes(16);
  const key = deriveKey();
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  const encrypted = Buffer.concat([cipher.update(plainText, 'utf8'), cipher.final()]);
  return `${iv.toString('hex')}:${encrypted.toString('hex')}`;
};

export const decryptText = (encryptedText: string): string => {
  const [ivHex, encryptedHex] = encryptedText.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const key = deriveKey();
  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(encryptedHex, 'hex')),
    decipher.final(),
  ]);
  return decrypted.toString('utf8');
};
