
import { Grid } from "@mui/material";

import Breadcrumb from 'src/layouts/full/shared/breadcrumb/Breadcrumb';
import PageContainer from 'src/components/container/PageContainer';

import ComplexCard from "../../../components/widgets/cards/ComplexCard";
import MusicCard from "../../../components/widgets/cards/MusicCard";
import EcommerceCard from "../../../components/widgets/cards/EcommerceCard";
import FollowerCard from "../../../components/widgets/cards/FollowerCard";
import FriendCard from "../../../components/widgets/cards/FriendCard";


import Settings from "../../../components/widgets/cards/Settings";
import GiftCard from "../../../components/widgets/cards/GiftCard";

const BCrumb = [
  {
    to: "/",
    title: "Home",
  },
  {
    title: "Cards",
  },
];

const WidgetCards = () => {
  return (
    (<PageContainer title="Cards" description="this is Cards">
      {/* breadcrumb */}
      <Breadcrumb title="Cards" items={BCrumb} />
      {/* end breadcrumb */}
      <Grid container spacing={3}>
        <Grid size={12}>
          <ComplexCard />
        </Grid>
        <Grid size={12}>
          <EcommerceCard />
        </Grid>
        <Grid size={12}>
          <MusicCard />
        </Grid>
        <Grid size={12}>
          <FollowerCard />
        </Grid>
        <Grid size={12}>
          <FriendCard />
        </Grid>
        <Grid
          size={{
            xs: 12,
            sm: 6,
            lg: 4
          }}>
          <Settings />
        </Grid>
        <Grid
          size={{
            xs: 12,
            lg: 8
          }}>
          <GiftCard />
        </Grid>
      </Grid>
    </PageContainer>)
  );
};

export default WidgetCards;
