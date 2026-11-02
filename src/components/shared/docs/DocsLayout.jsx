import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Fuse from 'fuse.js';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  Autocomplete,
  Box,
  CircularProgress,
  Grid,
  List,
  ListItemButton,
  ListItemText,
  Paper,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import MenuBookOutlinedIcon from '@mui/icons-material/MenuBookOutlined';
import InputAdornment from '@mui/material/InputAdornment';
import PageContainer from '@/components/container/PageContainer';
import ParentCard from '@/components/shared/ParentCard';
import DocImage from '@/components/shared/docs/DocImage';

const HOME_SLUG = 'index';

// Same categorical palette this app already uses for stat cards and
// category badges elsewhere (bursary category placement, dashboards) —
// reused here, not reinvented, so the manual's colors feel native to the
// app rather than a bolt-on. Assigned by a stable hash of the group name
// so a given section always gets the same color, regardless of fetch order.
const GROUP_COLORS = [
  '#2563EB', // blue
  '#16A34A', // green
  '#D97706', // orange
  '#9333EA', // purple
  '#DB2777', // pink
  '#0D9488', // teal
  '#4F46E5', // indigo
  '#DC2626', // red
];

const colorForGroup = (name) => {
  let hash = 0;
  for (let i = 0; i < name.length; i += 1) hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  return GROUP_COLORS[hash % GROUP_COLORS.length];
};

// The shared shell for both manuals (tenant /docs, landlord /help) — same
// sidebar + search + content-pane UI either way, parameterized by which
// gated API calls to use so the two manuals' content never mixes.
const DocsLayout = ({ title, basePath, fetchManifest, fetchPage, fetchImage }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const navigate = useNavigate();
  const { '*': slugParam } = useParams();
  const activeSlug = slugParam || HOME_SLUG;

  const [manifest, setManifest] = useState([]);
  const [loadingManifest, setLoadingManifest] = useState(true);
  const [page, setPage] = useState(null);
  const [loadingPage, setLoadingPage] = useState(true);
  const [pageError, setPageError] = useState(false);
  const [searchInput, setSearchInput] = useState('');

  // The hero bar and sidebar need to be genuinely fixed in place — not
  // "sticky" (which only holds position within whatever ancestor happens
  // to scroll) — with the content pane as the sole scrolling element.
  // Rather than hardcode the app shell's own header height (it varies —
  // an impersonation banner or subscription-grace banner can add to it),
  // measure the real distance from this component's own top edge to the
  // bottom of the viewport, and size this component to exactly that —
  // its own internal rows then split that fixed height between a
  // non-scrolling hero row and a scrolling body row.
  const rootRef = useRef(null);
  const [availableHeight, setAvailableHeight] = useState(null);

  useEffect(() => {
    const measure = () => {
      if (!rootRef.current) return;
      // Once `position: sticky` has engaged (the user has scrolled past
      // where this block's natural position would go), its own
      // `getBoundingClientRect().top` reads as the sticky `top` offset
      // (0), not its true document position — so re-measuring mid-scroll
      // (e.g. on a resize) would otherwise wrongly add the full scroll
      // distance on top of the viewport height. Clamping to 0 sidesteps
      // that: stuck-at-0 correctly means "this block's top IS the
      // viewport's top," so the available height is simply the full
      // viewport height, in either state.
      const top = Math.max(0, rootRef.current.getBoundingClientRect().top);
      setAvailableHeight(window.innerHeight - top);
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  useEffect(() => {
    fetchManifest()
      .then((res) => setManifest(res?.data || []))
      .catch(() => setManifest([]))
      .finally(() => setLoadingManifest(false));
  }, [fetchManifest]);

  useEffect(() => {
    setLoadingPage(true);
    setPageError(false);
    fetchPage(activeSlug)
      .then((res) => setPage(res?.data || null))
      .catch(() => setPageError(true))
      .finally(() => setLoadingPage(false));
  }, [activeSlug, fetchPage]);

  const groups = useMemo(() => {
    const byGroup = new Map();
    manifest.forEach((item) => {
      if (!byGroup.has(item.group)) byGroup.set(item.group, []);
      byGroup.get(item.group).push(item);
    });
    return Array.from(byGroup.entries()).map(([name, pages]) => ({
      name,
      pages,
      color: colorForGroup(name),
    }));
  }, [manifest]);

  const fuse = useMemo(
    () =>
      new Fuse(manifest, {
        keys: [
          { name: 'title', weight: 3 },
          { name: 'headings', weight: 2 },
          { name: 'searchText', weight: 1 },
        ],
        threshold: 0.3,
        ignoreLocation: true,
      }),
    [manifest],
  );

  const searchResults = useMemo(() => {
    if (!searchInput.trim()) return [];
    return fuse.search(searchInput).map((r) => r.item);
  }, [searchInput, fuse]);

  const goToSlug = useCallback(
    (slug) => {
      navigate(slug === HOME_SLUG ? basePath : `${basePath}/${slug}`);
    },
    [navigate, basePath],
  );

  const fetchImageCallback = useCallback((path) => fetchImage(path), [fetchImage]);
  const activeColor = useMemo(
    () => groups.find((g) => g.pages.some((p) => p.slug === activeSlug))?.color || GROUP_COLORS[0],
    [groups, activeSlug],
  );

  return (
    <PageContainer title={title} description={`${title} — in-app user manual`}>
      {/* Everything below is sized to exactly fill the viewport space
          available to this page (measured, not guessed — see
          `availableHeight` above) and never itself scrolls; only the
          content pane in the body row does. `position: sticky` here is
          load-bearing, not decorative: without it, this block is just a
          normal-flow element — if anything on the page (e.g. the app
          shell's own footer) makes the *document* taller than the
          viewport, the browser scrolls the whole page, dragging this
          whole fixed-height block (hero, sidebar, and all) up and off
          screen with it, which defeats the point entirely. Sticky keeps
          it pinned to the top of the viewport once scrolled to, no
          matter which ancestor (or the document itself) ends up being
          the thing that actually scrolls. Mobile (xs) opts out entirely
          and just flows/scrolls like an ordinary page — a fixed-height
          app-like shell isn't the right feel on a small screen. */}
      <Box
        ref={rootRef}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          position: { md: 'sticky' },
          top: { md: 0 },
          height: { md: availableHeight ? `${availableHeight}px` : 'auto' },
          overflow: { md: 'hidden' },
        }}
      >
        {/* Hero bar — title + search together, same letterhead-gradient
            language used elsewhere in the app (receipts, bursary setup).
            A plain flex row, pinned simply by virtue of its non-scrolling
            parent above. */}
        <Box
          sx={{
            flexShrink: 0,
            borderRadius: 3,
            p: { xs: 2, md: 2.5 },
            mb: 2.5,
            bgcolor: isDark ? 'rgba(30,77,183,0.12)' : '#EFF4FD',
            border: '1px solid',
            borderColor: isDark ? 'rgba(30,77,183,0.3)' : '#DCE6FA',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: 2.5,
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              background: 'linear-gradient(135deg, #1e4db7 0%, #2563EB 100%)',
            }}
          >
            <MenuBookOutlinedIcon />
          </Box>
          <Typography variant="h5" fontWeight={700} sx={{ flexShrink: 0 }}>
            {title}
          </Typography>

          <Box sx={{ flex: 1, minWidth: 220, ml: { md: 'auto' } }}>
            <Autocomplete
              freeSolo
              options={searchResults}
              filterOptions={(x) => x}
              getOptionLabel={(option) => (typeof option === 'string' ? option : option.title)}
              inputValue={searchInput}
              onInputChange={(_e, value) => setSearchInput(value)}
              onChange={(_e, value) => {
                if (value && typeof value !== 'string') goToSlug(value.slug);
              }}
              renderOption={(props, option) => (
                <li {...props} key={option.slug}>
                  <Box
                    sx={{
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      bgcolor: colorForGroup(option.group),
                      mr: 1.25,
                      flexShrink: 0,
                    }}
                  />
                  <Box sx={{ minWidth: 0 }}>
                    <Typography variant="body2" fontWeight={600}>
                      {option.title}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" noWrap display="block">
                      {option.group} · {option.excerpt}
                    </Typography>
                  </Box>
                </li>
              )}
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder="Search the manual..."
                  size="small"
                  sx={{
                    bgcolor: isDark ? 'rgba(0,0,0,0.2)' : '#fff',
                    borderRadius: 1.5,
                    maxWidth: 420,
                  }}
                  slotProps={{
                    input: {
                      ...params.InputProps,
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon fontSize="small" />
                        </InputAdornment>
                      ),
                    },
                  }}
                />
              )}
            />
          </Box>
        </Box>

        {/* Body row: fills whatever height the hero didn't use, and is
            itself non-scrolling at md+ — the sidebar card and the
            content pane each manage their own scrolling independently. */}
        <Grid
          container
          spacing={2}
          sx={{
            flex: { md: 1 },
            minHeight: { md: 0 },
            overflow: { md: 'hidden' },
          }}
        >
          <Grid size={{ xs: 12, md: 3 }} sx={{ height: { md: '100%' } }}>
            <ParentCard
              sx={{
                height: { md: '100%' },
                // The card itself never moves; its own list scrolls
                // independently once it's taller than the space it's
                // been given, instead of pushing the page down.
                overflowY: { md: 'auto' },
              }}
            >
              {loadingManifest ? (
                <Box display="flex" justifyContent="center" py={3}>
                  <CircularProgress size={24} />
                </Box>
              ) : (
                <List dense disablePadding>
                  {groups.map((group, groupIndex) => (
                    <Box key={group.name} sx={{ mt: groupIndex === 0 ? 0 : 1.5 }}>
                      <Box
                        sx={{ display: 'flex', alignItems: 'center', gap: 0.75, px: 1, mb: 0.5 }}
                      >
                        <Box
                          sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: group.color }}
                        />
                        <Typography
                          variant="caption"
                          fontWeight={700}
                          sx={{
                            letterSpacing: 0.4,
                            textTransform: 'uppercase',
                            color: group.color,
                          }}
                        >
                          {group.name}
                        </Typography>
                      </Box>
                      {group.pages.map((item) => {
                        const isActive = item.slug === activeSlug;
                        return (
                          <ListItemButton
                            key={item.slug}
                            selected={isActive}
                            onClick={() => goToSlug(item.slug)}
                            sx={{
                              borderRadius: 1.5,
                              py: 0.5,
                              pl: 1.5,
                              mb: 0.25,
                              borderLeft: '3px solid',
                              borderLeftColor: isActive ? group.color : 'transparent',
                              '&.Mui-selected': {
                                bgcolor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.035)',
                              },
                              '&.Mui-selected:hover': {
                                bgcolor: isDark ? 'rgba(255,255,255,0.09)' : 'rgba(0,0,0,0.05)',
                              },
                            }}
                          >
                            <ListItemText
                              primary={item.title}
                              slotProps={{
                                primary: {
                                  fontSize: 13.5,
                                  fontWeight: isActive ? 700 : 500,
                                  color: isActive ? 'text.primary' : 'text.secondary',
                                },
                              }}
                            />
                          </ListItemButton>
                        );
                      })}
                    </Box>
                  ))}
                </List>
              )}
            </ParentCard>
          </Grid>

          <Grid size={{ xs: 12, md: 9 }} sx={{ height: { md: '100%' } }}>
            {/* The one element that actually scrolls. */}
            <Paper
              variant="outlined"
              sx={{
                p: { xs: 2.5, md: 4 },
                borderRadius: 3,
                height: { md: '100%' },
                overflowY: { md: 'auto' },
              }}
            >
              {loadingPage ? (
                <Box display="flex" justifyContent="center" py={6}>
                  <CircularProgress />
                </Box>
              ) : pageError || !page ? (
                <Typography color="error">
                  This page couldn't be found. Pick a topic from the sidebar.
                </Typography>
              ) : (
                <Box
                  sx={{
                    '& h1': { fontSize: 26, fontWeight: 700, mt: 0, mb: 2, color: activeColor },
                    '& h2': {
                      fontSize: 20,
                      fontWeight: 700,
                      mt: 3.5,
                      mb: 1.25,
                      pb: 0.75,
                      borderBottom: '2px solid',
                      borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
                    },
                    '& h3': { fontSize: 16.5, fontWeight: 700, mt: 2.5, mb: 1 },
                    '& p': { fontSize: 15, lineHeight: 1.7, mb: 1.25 },
                    '& ul, & ol': { pl: 3, mb: 1.25 },
                    '& li': { fontSize: 15, lineHeight: 1.7 },
                    '& li > strong:first-of-type': { color: activeColor },
                    '& code': {
                      bgcolor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(30,77,183,0.08)',
                      color: isDark ? undefined : '#1e4db7',
                      px: 0.6,
                      py: 0.1,
                      borderRadius: 0.75,
                      fontSize: 13.5,
                    },
                    '& table': {
                      borderCollapse: 'collapse',
                      width: '100%',
                      my: 2,
                      borderRadius: 1.5,
                      overflow: 'hidden',
                    },
                    '& th': {
                      bgcolor: isDark ? 'rgba(37,99,235,0.18)' : '#EFF4FD',
                      fontWeight: 700,
                      color: isDark ? undefined : '#1e4db7',
                    },
                    '& th, & td': {
                      border: '1px solid',
                      borderColor: 'divider',
                      px: 1.5,
                      py: 0.85,
                      fontSize: 14,
                      textAlign: 'left',
                    },
                    '& blockquote': {
                      borderLeft: '3px solid',
                      borderColor: activeColor,
                      bgcolor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                      borderRadius: '0 8px 8px 0',
                      m: 0,
                      mb: 1.5,
                      px: 2,
                      py: 1,
                      color: 'text.secondary',
                    },
                    '& a': { color: activeColor, fontWeight: 600 },
                  }}
                >
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      img: ({ src, alt }) => (
                        <DocImage src={src} alt={alt} fetchImage={fetchImageCallback} />
                      ),
                      // A link to another page in this same manual (written
                      // in content as an absolute `${basePath}/...` path)
                      // navigates client-side instead of a full page reload;
                      // anything else (external links) opens normally.
                      a: ({ href, children }) => {
                        const isInternal = href?.startsWith(basePath);
                        if (isInternal) {
                          return (
                            <Box
                              component="a"
                              href={href}
                              onClick={(e) => {
                                e.preventDefault();
                                navigate(href);
                              }}
                              sx={{ color: activeColor, fontWeight: 600, cursor: 'pointer' }}
                            >
                              {children}
                            </Box>
                          );
                        }
                        return (
                          <a href={href} target="_blank" rel="noopener noreferrer">
                            {children}
                          </a>
                        );
                      },
                    }}
                  >
                    {page.content}
                  </ReactMarkdown>
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </PageContainer>
  );
};

export default DocsLayout;
