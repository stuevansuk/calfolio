export interface StorageProvider {
  uploadImage(
    file: Buffer,
    key: string,
    contentType: string
  ): Promise<{ publicUrl: string; storageKey: string }>;

  getPresignedUploadUrl(
    key: string,
    contentType: string
  ): Promise<{ uploadUrl: string; publicUrl: string } | null>;

  deleteImage(key: string): Promise<void>;
}
