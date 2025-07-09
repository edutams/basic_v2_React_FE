import React, { useState } from 'react';
import {
  Box,
  Typography,
  Checkbox,
  Button,
  Paper,
  Grid,
  Link,
  Stack,
  Chip,
} from '@mui/material';

// Accepts the same tree structure as combinedPackageTree from Plan.jsx
const flattenTreeToCategories = (tree) => {
  // Flattens the tree into categories with features
  return tree.map((section) => {
    const features = [];
    const traverse = (nodes, parentLabel = null) => {
      nodes.forEach((node) => {
        if (node.children) {
          traverse(node.children, node.label);
        } else {
          features.push({
            id: parentLabel ? `${parentLabel} > ${node.label}` : node.label,
            label: node.label,
            parent: parentLabel || section.label,
            description: node.description || 'Feature description goes here.',
          });
        }
      });
    };
    traverse(section.children || [], section.label);
    if (!section.children) {
      features.push({
        id: section.label,
        label: section.label,
        parent: section.label,
        description: section.description || 'Feature description goes here.',
      });
    }
    return {
      category: section.label,
      features,
    };
  });
};

const scrollShadow = {
  position: 'relative',
  '&:after': {
    content: '""',
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '24px',
    pointerEvents: 'none',
    background: 'linear-gradient(180deg, rgba(245,246,250,0) 0%, #f5f6fa 100%)',
    zIndex: 1,
  },
};

const categoryHeaderSx = {
  bgcolor: '#e9ecef',
  borderTopLeftRadius: 12,
  borderTopRightRadius: 12,
  px: 2,
  py: 1.5,
  mb: 2,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
};

const PackageManager = ({ selectedPlan, currentPermissions = [], onSave, onCancel, combinedPackageTree }) => {
  const categories = flattenTreeToCategories(combinedPackageTree);
  const [selectedFeatures, setSelectedFeatures] = useState(currentPermissions);

  const handleFeatureChange = (featureId, checked) => {
    let newFeatures;
    if (checked) {
      newFeatures = [...selectedFeatures, featureId];
    } else {
      newFeatures = selectedFeatures.filter((id) => id !== featureId);
    }
    setSelectedFeatures(newFeatures);
  };

  const handleSelectAll = (categoryFeatures) => {
    const categoryIds = categoryFeatures.map((f) => f.id);
    const allSelected = categoryIds.every((id) => selectedFeatures.includes(id));
    let newFeatures;
    if (allSelected) {
      newFeatures = selectedFeatures.filter((id) => !categoryIds.includes(id));
    } else {
      const toAdd = categoryIds.filter((id) => !selectedFeatures.includes(id));
      newFeatures = [...selectedFeatures, ...toAdd];
    }
    setSelectedFeatures(newFeatures);
  };

  const handleSave = () => {
    onSave(selectedFeatures);
  };

  return (
    <Box>
      <Typography variant="h6" mb={2}>
        Manage Package Features for {selectedPlan?.name || 'Plan'}
      </Typography>
      <Typography variant="subtitle1" color="primary" fontWeight={600} mb={3}>
        Custom Package Settings
      </Typography>
      <Grid container spacing={3}>
        {categories.map(({ category, features }) => {
          const selectedCount = features.filter((f) => selectedFeatures.includes(f.id)).length;
          const isScrollable = features.length > 3;
          return (
            <Grid item xs={12} sm={6} key={category}>
              <Paper
                variant="outlined"
                sx={{
                  p: 0,
                  borderRadius: 3,
                  boxShadow: 'none',
                  minHeight: 200,
                  bgcolor: '#f5f6fa',
                  border: 'none',
                  overflow: 'hidden',
                }}
              >
                <Box sx={categoryHeaderSx}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Typography variant="subtitle1" fontWeight={700}>{category}</Typography>
                    <Chip
                      label={`${selectedCount}/${features.length}`}
                      size="small"
                      sx={{ bgcolor: '#fff', color: 'primary.main', fontWeight: 600 }}
                    />
                  </Stack>
                  <Link
                    component="button"
                    variant="body2"
                    underline="none"
                    color="primary"
                    fontWeight={600}
                    onClick={() => handleSelectAll(features)}
                    sx={{ cursor: 'pointer' }}
                  >
                    {selectedCount === features.length ? 'Unselect All' : 'Select All'}
                  </Link>
                </Box>
                <Box
                  sx={isScrollable ? {
                    maxHeight: 220,
                    overflowY: 'auto',
                    pr: 1,
                    borderRadius: 2,
                    ...scrollShadow,
                  } : { px: 3, pb: 3 }}
                >
                  <Stack spacing={2}>
                    {features.map((feature) => (
                      <Box
                        key={feature.id}
                        sx={{
                          display: 'flex',
                          alignItems: 'flex-start',
                        }}
                      >
                        <Checkbox
                          checked={selectedFeatures.includes(feature.id)}
                          onChange={(e) => handleFeatureChange(feature.id, e.target.checked)}
                          sx={{ mt: 0.5 }}
                        />
                        <Box ml={1}>
                          <Typography variant="body1" fontWeight={600} lineHeight={1.2}>
                            {feature.label}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" fontSize={13} mt={0.5}>
                            {feature.description}
                          </Typography>
                        </Box>
                      </Box>
                    ))}
                  </Stack>
                </Box>
              </Paper>
            </Grid>
          );
        })}
      </Grid>
      <Box display="flex" justifyContent="flex-end" gap={2} mt={4}>
        <Button onClick={onCancel} color="inherit" variant="outlined">
          Cancel
        </Button>
        <Button onClick={handleSave} color="primary" variant="contained">
          Save
        </Button>
      </Box>
    </Box>
  );
};

export default PackageManager; 