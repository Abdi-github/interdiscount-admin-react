import { useRef, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  CircularProgress,
  IconButton,
  ImageList,
  ImageListItem,
  ImageListItemBar,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import { useTranslation } from 'react-i18next';
import { useNotification } from '@/shared/hooks/useNotification';
import {
  useUploadProductImagesMutation,
  useDeleteProductImageMutation,
} from '../products.api';
import type { ProductImage } from '../products.types';

// ─── Props ────────────────────────────────────────────────────────────────────

interface ProductImageUploadProps {
  productId: string;
  images: ProductImage[];
}

// ─── Constants ────────────────────────────────────────────────────────────────

const MAX_FILES = 10;
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

// ─── Component ────────────────────────────────────────────────────────────────

export function ProductImageUpload({ productId, images }: ProductImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previews, setPreviews] = useState<{ file: File; objectUrl: string }[]>([]);
  const [fileError, setFileError] = useState<string | null>(null);

  const { success, error } = useNotification();
  const { t } = useTranslation('products');
  const { t: tc } = useTranslation('common');
  const [uploadImages, { isLoading: isUploading }] = useUploadProductImagesMutation();
  const [deleteImage, { isLoading: isDeleting }] = useDeleteProductImageMutation();

  // ── File selection ─────────────────────────────────────────────────────────

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError(null);
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;

    const invalid = files.filter((f) => !ACCEPTED_TYPES.includes(f.type));
    if (invalid.length) {
      setFileError(t('messages.image_type_error'));
      return;
    }

    const remaining = MAX_FILES - images.length;
    if (files.length > remaining) {
      setFileError(t('messages.image_max_error', { max: MAX_FILES, remaining }));
      return;
    }

    const newPreviews = files.map((file) => ({
      file,
      objectUrl: URL.createObjectURL(file),
    }));
    setPreviews((prev) => [...prev, ...newPreviews]);
    // Reset input so the same file can be re-selected if removed
    e.target.value = '';
  };

  const removePreview = (objectUrl: string) => {
    setPreviews((prev) => {
      const removed = prev.find((p) => p.objectUrl === objectUrl);
      if (removed) URL.revokeObjectURL(removed.objectUrl);
      return prev.filter((p) => p.objectUrl !== objectUrl);
    });
  };

  // ── Upload ─────────────────────────────────────────────────────────────────

  const handleUpload = async () => {
    if (!previews.length) return;
    try {
      await uploadImages({
        id: productId,
        files: previews.map((p) => p.file),
      }).unwrap();
      // Revoke object URLs to free memory
      previews.forEach((p) => URL.revokeObjectURL(p.objectUrl));
      setPreviews([]);
      success(t('messages.image_uploaded'));
    } catch {
      error(tc('errors.generic'));
    }
  };

  // ── Delete existing ────────────────────────────────────────────────────────

  const handleDelete = async (imageId: string) => {
    try {
      await deleteImage({ productId, imageId }).unwrap();
      success(t('messages.image_deleted'));
    } catch {
      error(tc('errors.generic'));
    }
  };

  return (
    <Card>
      <CardHeader
        title={t('images.title')}
        subheader={t('images.card_subheader', { count: images.length, max: MAX_FILES })}
        action={
          <Button
            variant="outlined"
            startIcon={<AddPhotoAlternateIcon />}
            size="small"
            disabled={isUploading || images.length >= MAX_FILES}
            onClick={() => fileInputRef.current?.click()}
          >
            {t('images.select_btn')}
          </Button>
        }
      />
      <CardContent>
        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED_TYPES.join(',')}
          multiple
          hidden
          onChange={handleFileSelect}
        />

        {fileError && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setFileError(null)}>
            {fileError}
          </Alert>
        )}

        {/* ── Existing images ── */}
        {images.length > 0 ? (
          <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              {t('images.saved')}
            </Typography>
            <ImageList cols={4} gap={8} sx={{ mb: 2, mt: 0 }}>
              {images.map((img) => (
                <ImageListItem
                  key={img._id ?? img.src.md}
                  sx={{
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 1,
                    overflow: 'hidden',
                  }}
                >
                  <img
                    src={img.src.sm || img.src.md}
                    alt={img.alt}
                    loading="lazy"
                    style={{ objectFit: 'cover', aspectRatio: '1', width: '100%' }}
                  />
                  <ImageListItemBar
                    sx={{ background: 'rgba(0,0,0,0.55)' }}
                    title={img.alt || '—'}
                    actionIcon={
                      <Tooltip title={t('images.delete_tooltip')}>
                        <IconButton
                          size="small"
                          sx={{ color: 'white' }}
                          disabled={isDeleting}
                          onClick={() => img._id && handleDelete(img._id)}
                        >
                          {isDeleting ? (
                            <CircularProgress size={14} color="inherit" />
                          ) : (
                            <DeleteIcon fontSize="small" />
                          )}
                        </IconButton>
                      </Tooltip>
                    }
                  />
                </ImageListItem>
              ))}
            </ImageList>
          </Box>
        ) : (
          !previews.length && (
            <Box
              sx={{
                border: '2px dashed',
                borderColor: 'divider',
                borderRadius: 2,
                p: 4,
                textAlign: 'center',
                color: 'text.secondary',
                mb: 2,
                cursor: images.length < MAX_FILES ? 'pointer' : 'default',
              }}
              onClick={() => images.length < MAX_FILES && fileInputRef.current?.click()}
            >
              <AddPhotoAlternateIcon sx={{ fontSize: 40, mb: 1, opacity: 0.4 }} />
              <Typography variant="body2">
                {t('images.click_to_upload', { max: MAX_FILES })}
              </Typography>
            </Box>
          )
        )}

        {/* ── Preview of files to upload ── */}
        {previews.length > 0 && (
          <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              {t('images.pending_uploads', { count: previews.length })}
            </Typography>
            <ImageList cols={4} gap={8} sx={{ mb: 2, mt: 0 }}>
              {previews.map((p) => (
                <ImageListItem
                  key={p.objectUrl}
                  sx={{
                    border: '2px solid',
                    borderColor: 'primary.main',
                    borderRadius: 1,
                    overflow: 'hidden',
                    opacity: isUploading ? 0.6 : 1,
                  }}
                >
                  <img
                    src={p.objectUrl}
                    alt={p.file.name}
                    style={{ objectFit: 'cover', aspectRatio: '1', width: '100%' }}
                  />
                  <ImageListItemBar
                    sx={{ background: 'rgba(0,0,0,0.55)' }}
                    title={p.file.name}
                    actionIcon={
                      !isUploading && (
                        <Tooltip title={t('images.remove')}>
                          <IconButton
                            size="small"
                            sx={{ color: 'white' }}
                            onClick={() => removePreview(p.objectUrl)}
                          >
                            <CloseIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )
                    }
                  />
                </ImageListItem>
              ))}
            </ImageList>
            <Stack direction="row" spacing={2}>
              <Button
                variant="contained"
                onClick={handleUpload}
                disabled={isUploading}
                startIcon={
                  isUploading ? <CircularProgress size={16} color="inherit" /> : undefined
                }
              >
                {isUploading ? t('images.uploading') : t('images.upload_btn', { count: previews.length })}
              </Button>
              <Button
                variant="outlined"
                color="inherit"
                onClick={() => {
                  previews.forEach((p) => URL.revokeObjectURL(p.objectUrl));
                  setPreviews([]);
                }}
                disabled={isUploading}
              >
                {t('images.discard_btn')}
              </Button>
            </Stack>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
