import React, { useState } from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';
import { IconCloudUpload, IconX, IconPhoto } from '@tabler/icons-react';

const ImageUpload = ({
  value,
  onChange,
  label = "Upload Image",
  error,
  helperText,
  shape = "square",
  width = 140,
  height = 140,
  defaultImage = "https://ik.imagekit.io/edx82gwzy/istockphoto-1332100919-612x612.jpg?updatedAt=1710424155848"
}) => {
  const [preview, setPreview] = useState(value || defaultImage);
  const [hasCustomImage, setHasCustomImage] = useState(!!value && value !== defaultImage);

  React.useEffect(() => {
    setPreview(value || defaultImage);
    setHasCustomImage(!!value && value !== defaultImage);
  }, [value, defaultImage]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
        setHasCustomImage(true);
        onChange(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClear = (e) => {
    e.stopPropagation();
    setPreview(defaultImage);
    setHasCustomImage(false);
    onChange(null);
  };

  return (
    <Box sx={{ width: '100%', mb: 2 }}>
      <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600, color: 'text.primary', letterSpacing: '0.02em' }}>
        {label}
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 2 }}>
        <Paper
          elevation={0}
          sx={{
            width,
            height,
            position: 'relative',
            borderRadius: shape === "circle" ? "50%" : "16px",
            border: theme => `2px dashed ${error ? theme.palette.error.main : theme.palette.divider}`,
            bgcolor: 'grey.50',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            overflow: 'hidden',
            cursor: 'pointer',
            '&:hover': {
              borderColor: 'primary.main',
              bgcolor: 'primary.lighter',
              '& .upload-overlay': { opacity: 1 }
            }
          }}
          component="label"
        >
          <input hidden accept="image/*" type="file" onChange={handleFileChange} />

          {preview ? (
            <>
              <Box
                component="img"
                src={preview}
                sx={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />
              <Box
                className="upload-overlay"
                sx={{
                  position: 'absolute',
                  inset: 0,
                  bgcolor: 'rgba(0,0,0,0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: 0,
                  transition: 'opacity 0.2s',
                  color: '#fff'
                }}
              >
                <IconCloudUpload size={32} />
              </Box>
            </>
          ) : (
            <Box sx={{ textAlign: 'center', color: 'text.secondary', p: 2 }}>
              <IconPhoto size={40} stroke={1.2} color="currentColor" />
              <Typography variant="caption" sx={{ mt: 1, display: 'block', fontWeight: 500 }}>
                Click to upload
              </Typography>
            </Box>
          )}
        </Paper>

        <Box sx={{ textAlign: 'left', width: '100%' }}>
          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-start', mb: 1 }}>
            <Button
              variant="outlined"
              size="small"
              component="label"
              startIcon={<IconCloudUpload size={16} />}
              sx={{
                borderRadius: '8px',
                textTransform: 'none',
                fontWeight: 600,
                px: 2
              }}
            >
              Browse File...
              <input hidden accept="image/*" type="file" onChange={handleFileChange} />
            </Button>

            {hasCustomImage && (
              <Button
                variant="text"
                color="error"
                size="small"
                onClick={handleClear}
                sx={{
                  borderRadius: '8px',
                  textTransform: 'none',
                  fontWeight: 600,
                }}
              >
                Remove
              </Button>
            )}
          </Box>

          <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.75rem', display: 'block' }}>
            Allowed JPG or PNG
          </Typography>
        </Box>
      </Box>

      {error && (
        <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block', textAlign: 'left', fontWeight: 500 }}>
          {helperText}
        </Typography>
      )}
    </Box>
  );
};

export default ImageUpload;
