import React from 'react';
import { Grid } from '@mui/material';
import Avatar from '@mui/material/Avatar';
import AvatarGroup from '@mui/material/AvatarGroup';
import Badge from '@mui/material/Badge';
import Stack from '@mui/material/Stack';
// common component
import Breadcrumb from '../../layouts/full/shared/breadcrumb/Breadcrumb';
import PageContainer from '../../components/container/PageContainer';
import ParentCard from '../../components/shared/ParentCard';
import ChildCard from '../../components/shared/ChildCard';

import User1 from '../../assets/images/users/1.jpg';
import User2 from '../../assets/images/users/2.jpg';
import User3 from '../../assets/images/users/3.jpg';
import User4 from '../../assets/images/users/4.jpg';
import User5 from '../../assets/images/users/5.jpg';
import { IconMoodSmile } from '@tabler/icons';

import ImageAvatarsCode from '../../components/material-ui/avatar/code/ImageAvatarsCode';
import LetterAvatarsCode from '../../components/material-ui/avatar/code/LetterAvatarsCode';
import IconAvatarsCode from '../../components/material-ui/avatar/code/IconAvatarsCode';
import VariantCode from '../../components/material-ui/avatar/code/VariantCode';
import GroupedCode from '../../components/material-ui/avatar/code/GroupedCode';
import GroupedSizeCode from '../../components/material-ui/avatar/code/GroupedSizeCode';
import WithBadgeCode from '../../components/material-ui/avatar/code/WithBadgeCode';
import SizesCode from '../../components/material-ui/avatar/code/SizesCode';

const BCrumb = [
  {
    to: '/',
    title: 'Home',
  },
  {
    title: 'Avatar',
  },
];

const MuiAvatar = () => (
  // 2

  (<PageContainer title="Avatar" description="this is Avatar page">
    {/* breadcrumb */}
    <Breadcrumb title="Avatar" items={BCrumb} />
    {/* end breadcrumb */}
    <ParentCard title="Avatar">
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, lg: 4, sm: 6 }} display="flex" alignItems="stretch">
          <ChildCard title="Image avatars" codeModel={<ImageAvatarsCode />}>
            <Stack direction="row" spacing={1} justifyContent="center">
              <Avatar alt="Remy Sharp" src={User1} />
              <Avatar alt="Travis Howard" src={User2} />
              <Avatar alt="Cindy Baker" src={User3} />
            </Stack>
          </ChildCard>
        </Grid>
        <Grid size={{ xs: 12, lg: 4, sm: 6 }} display="flex" alignItems="stretch">
          <ChildCard title="Letter avatars" codeModel={<LetterAvatarsCode />}>
            <Stack direction="row" spacing={1} justifyContent="center">
              <Avatar sx={{ bgcolor: 'primary.main' }}>A</Avatar>
              <Avatar sx={{ bgcolor: 'secondary.main' }}>B</Avatar>
              <Avatar sx={{ bgcolor: 'error.main' }}>C</Avatar>
              <Avatar sx={{ bgcolor: 'warning.main' }}>D</Avatar>
              <Avatar sx={{ bgcolor: 'success.main' }}>E</Avatar>
            </Stack>
          </ChildCard>
        </Grid>
        <Grid size={{ xs: 12, lg: 4, sm: 6 }} display="flex" alignItems="stretch">
          <ChildCard title="Icon avatars" codeModel={<IconAvatarsCode />}>
            <Stack direction="row" spacing={1} justifyContent="center">
              <Avatar sx={{ bgcolor: 'primary.main' }}>
                <IconMoodSmile width={24} />
              </Avatar>
              <Avatar sx={{ bgcolor: 'secondary.main' }}>
                <IconMoodSmile width={24} />
              </Avatar>
              <Avatar sx={{ bgcolor: 'error.main' }}>
                <IconMoodSmile width={24} />
              </Avatar>
              <Avatar sx={{ bgcolor: 'warning.main' }}>
                <IconMoodSmile width={24} />
              </Avatar>
              <Avatar sx={{ bgcolor: 'success.main' }}>
                <IconMoodSmile width={24} />
              </Avatar>
            </Stack>
          </ChildCard>
        </Grid>
        <Grid size={{ xs: 12, lg: 4, sm: 6 }} display="flex" alignItems="stretch">
          <ChildCard title="Variant" codeModel={<VariantCode />}>
            <Stack direction="row" spacing={1} justifyContent="center">
              <Avatar sx={{ bgcolor: 'primary.main' }}>
                <IconMoodSmile width={24} />
              </Avatar>
              <Avatar sx={{ bgcolor: 'primary.main' }} variant="square">
                <IconMoodSmile width={24} />
              </Avatar>
              <Avatar sx={{ bgcolor: 'primary.main' }} variant="rounded">
                <IconMoodSmile width={24} />
              </Avatar>
            </Stack>
          </ChildCard>
        </Grid>
        <Grid size={{ xs: 12, lg: 4, sm: 6 }} display="flex" alignItems="stretch">
          <ChildCard title="Grouped" codeModel={<GroupedCode />}>
            <Stack direction="row" spacing={1} justifyContent="center">
              <AvatarGroup max={4}>
                <Avatar alt="Remy Sharp" src={User1} />
                <Avatar alt="Travis Howard" src={User2} />
                <Avatar alt="Cindy Baker" src={User3} />
              </AvatarGroup>
            </Stack>
          </ChildCard>
        </Grid>
        <Grid size={{ xs: 12, lg: 4, sm: 6 }} display="flex" alignItems="stretch">
          <ChildCard title="Grouped Size" codeModel={<GroupedSizeCode />}>
            <Stack direction="row" spacing={1} justifyContent="center">
              <AvatarGroup max={4}>
                <Avatar alt="Remy Sharp" sx={{ width: 56, height: 56 }} src={User1} />
                <Avatar alt="Travis Howard" sx={{ width: 56, height: 56 }} src={User2} />
                <Avatar alt="Cindy Baker" sx={{ width: 56, height: 56 }} src={User3} />
              </AvatarGroup>
            </Stack>
          </ChildCard>
        </Grid>
        <Grid size={{ xs: 12, lg: 4, sm: 6 }} display="flex" alignItems="stretch">
          <ChildCard title="With Badge" codeModel={<WithBadgeCode />}>
            <Stack direction="row" spacing={1} justifyContent="center">
              <AvatarGroup>
                <Badge
                  overlap="circular"
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                  badgeContent={
                    <Avatar sx={{ width: 22, height: 22 }} alt="Remy Sharp" src={User1} />
                  }
                >
                  <Avatar alt="Travis Howard" src={User2} />
                </Badge>
              </AvatarGroup>
              {/* 2 */}
              <Badge
                overlap="circular"
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                variant="dot"
                color="success"
              >
                <Avatar alt="Remy Sharp" src={User3} />
              </Badge>
              {/* 3 */}
              <Badge
                overlap="circular"
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                variant="dot"
                color="warning"
              >
                <Avatar alt="Remy Sharp" src={User4} />
              </Badge>
              {/* 4 */}
              <Badge
                overlap="circular"
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                variant="dot"
                color="error"
              >
                <Avatar alt="Remy Sharp" src={User5} />
              </Badge>
            </Stack>
          </ChildCard>
        </Grid>
        <Grid size={{ xs: 12, lg: 8, sm: 6 }} display="flex" alignItems="stretch">
          <ChildCard title="Sizes" codeModel={<SizesCode />}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} justifyContent="center">
              <Avatar alt="Remy Sharp" src={User1} sx={{ width: 24, height: 24 }} />
              <Avatar alt="Remy Sharp" src={User1} sx={{ width: 32, height: 32 }} />
              <Avatar alt="Remy Sharp" src={User1} />
              <Avatar alt="Remy Sharp" src={User1} sx={{ width: 50, height: 50 }} />
              <Avatar alt="Remy Sharp" src={User1} sx={{ width: 60, height: 60 }} />
              <Avatar alt="Remy Sharp" src={User1} sx={{ width: 65, height: 65 }} />
            </Stack>
          </ChildCard>
        </Grid>
      </Grid>
    </ParentCard>
  </PageContainer>)
);
export default MuiAvatar;
