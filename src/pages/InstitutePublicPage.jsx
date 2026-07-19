import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box, Container, Typography, Grid, Card, CardContent,
  CircularProgress, Chip, Stack, Avatar, Divider, Button,
  Paper, LinearProgress, AppBar, Toolbar, IconButton, Drawer,
  List, ListItemButton, ListItemText,
} from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import GroupsIcon from '@mui/icons-material/Groups';
import HowToRegIcon from '@mui/icons-material/HowToReg';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import AutoGraphIcon from '@mui/icons-material/AutoGraph';
import DoubleArrowIcon from '@mui/icons-material/DoubleArrow';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import api from '@/config/api';
import { motion } from 'framer-motion';

const heroBg = 'linear-gradient(135deg, #0d1b4a 0%, #1a237e 40%, #283593 70%, #1565c0 100%)';

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-40px' },
  transition: { duration: 0.5 },
};

function StatCard({ icon, label, value, color, borderRight }) {
  return (
    <Box sx={{ textAlign: 'center', py: { xs: 1.5, sm: 3 }, px: { xs: 0.5, sm: 1 }, borderRight: borderRight ? '1px solid' : 'none', borderColor: 'divider' }}>
      <Box sx={{ color, mb: { xs: 0, sm: 0.5 }, display: 'flex', justifyContent: 'center' }}>
        {icon}
      </Box>
      <Typography variant={{ xs: 'h5', sm: 'h4' }} fontWeight={800} lineHeight={1.2} fontSize={{ xs: '1.25rem', sm: '2rem' }}>
        {value}
      </Typography>
      <Typography variant="caption" color="text.secondary" fontWeight={500} textTransform="uppercase" letterSpacing="0.05em" fontSize={{ xs: '0.55rem', sm: '0.7rem' }}
        sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {label}
      </Typography>
    </Box>
  );
}

export default function InstitutePublicPage() {
  const { slug } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (!slug) { setError(true); setLoading(false); return; }
    api.get(`/public/institute/${slug}/programs`)
      .then(res => { setData(res.data.data); setLoading(false); })
      .catch(() => { setError(true); setLoading(false); });
  }, [slug]);

  useEffect(() => {
    if (data?.institute?.name) {
      document.title = `${data.institute.name} - STP Management`;
    }
  }, [data]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollTo = (id) => {
    setDrawerOpen(false);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', bgcolor: '#f5f5f5' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !data?.institute) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', bgcolor: '#f5f5f5', px: 2 }}>
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
          <Box textAlign="center">
            <SchoolIcon sx={{ fontSize: 72, color: 'text.disabled', mb: 2 }} />
            <Typography variant="h5" color="text.secondary" fontWeight={600}>Institute not found</Typography>
            <Typography variant="body2" color="text.disabled" sx={{ mt: 1 }}>Please check the link and try again</Typography>
          </Box>
        </motion.div>
      </Box>
    );
  }

  const inst = data.institute;
  const courses = data.courses || [];
  const totalBatches = courses.reduce((s, c) => s + (c.batches?.length || 0), 0);
  const totalCapacity = courses.reduce((s, c) => s + (c.batches?.reduce((ss, b) => ss + Number(b.capacity), 0) || 0), 0);
  const shortName = inst.name.replace(/Institute|Training|College|Academy/i, '').trim();

  const navItems = [
    { label: 'Home', href: '#hero' },
    { label: 'Programs', href: '#programs' },
    { label: 'How to Apply', href: '#how-to-apply' },
    { label: 'Contact', href: '#contact' },
  ];

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5' }}>

      {/* ── Header ── */}
      <AppBar position="fixed" elevation={scrolled ? 4 : 0} sx={{
        bgcolor: scrolled ? 'rgba(13,27,74,0.97)' : 'transparent',
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
        boxShadow: scrolled ? '0 2px 20px rgba(0,0,0,0.15)' : 'none',
        transition: 'all 0.3s ease',
      }}>
        <Container maxWidth="lg">
          <Toolbar disableGutters sx={{ minHeight: { xs: 52, md: 64 } }}>
            <SchoolIcon sx={{ color: 'white', mr: 1, fontSize: { xs: 22, sm: 28 } }} />
            <Typography variant="h6" fontWeight={700} color="white" noWrap sx={{ fontSize: { xs: '0.85rem', sm: '1.1rem' } }}>
              {shortName || inst.name}
            </Typography>
            <Box sx={{ flexGrow: 1 }} />
            <Stack direction="row" spacing={0.5} sx={{ display: { xs: 'none', md: 'flex' } }}>
              {navItems.map((item) => (
                <Button key={item.label} onClick={() => scrollTo(item.href.replace('#', ''))}
                  sx={{ color: 'rgba(255,255,255,0.85)', fontWeight: 500, fontSize: '0.875rem', '&:hover': { color: 'white', bgcolor: 'rgba(255,255,255,0.1)' } }}>
                  {item.label}
                </Button>
              ))}
            </Stack>
            <IconButton onClick={() => setDrawerOpen(true)} sx={{ display: { md: 'none' }, color: 'white' }}>
              <MenuIcon />
            </IconButton>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Mobile drawer */}
      <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}
        PaperProps={{ sx: { width: 260, bgcolor: '#0d1b4a', color: 'white' } }}>
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'flex-end' }}>
          <IconButton onClick={() => setDrawerOpen(false)} sx={{ color: 'white' }}><CloseIcon /></IconButton>
        </Box>
        <List>
          {navItems.map((item) => (
            <ListItemButton key={item.label} onClick={() => scrollTo(item.href.replace('#', ''))}
              sx={{ '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}>
              <ListItemText primary={item.label} primaryTypographyProps={{ fontWeight: 500 }} />
            </ListItemButton>
          ))}
        </List>
      </Drawer>

      {/* ── Hero ── */}
      <Box id="hero" sx={{
        background: heroBg, color: 'white',
        pt: { xs: 9, md: 14 }, pb: { xs: 5, md: 9 },
        position: 'relative', overflow: 'hidden',
      }}>
        <Box sx={{
          position: 'absolute', inset: 0, opacity: 0.05,
          backgroundImage: 'radial-gradient(circle at 25% 50%, white 1px, transparent 1px)',
          backgroundSize: '30px 30px',
        }} />
        <Container maxWidth="md" sx={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <Avatar sx={{
              width: { xs: 72, sm: 100 }, height: { xs: 72, sm: 100 },
              mx: 'auto', mb: { xs: 1.5, sm: 2 },
              bgcolor: 'rgba(255,255,255,0.12)',
              border: '3px solid rgba(255,255,255,0.3)',
              boxShadow: '0 8px 40px rgba(0,0,0,0.25)',
            }}>
              <SchoolIcon sx={{ fontSize: { xs: 36, sm: 52 } }} />
            </Avatar>
            <Typography
              variant="h3" fontWeight={800}
              fontSize={{ xs: '1.35rem', sm: '2rem', md: '3rem' }}
              gutterBottom
              sx={{ lineHeight: { xs: 1.3, sm: 1.2 }, overflowWrap: 'break-word', wordBreak: 'break-word' }}
            >
              {inst.name}
            </Typography>
            {inst.name_bn && (
              <Typography variant="h5" sx={{ opacity: 0.75, mb: 1, fontWeight: 500, fontSize: { xs: '1rem', sm: '1.5rem' }, overflowWrap: 'break-word', wordBreak: 'break-word' }}>
                {inst.name_bn}
              </Typography>
            )}
            {inst.stp_code && (
              <Chip label={`STP: ${inst.stp_code}`} size="small"
                sx={{
                  color: 'white', borderColor: 'rgba(255,255,255,0.3)',
                  backdropFilter: 'blur(4px)', bgcolor: 'rgba(255,255,255,0.05)',
                  mb: 2,
                }}
                variant="outlined"
              />
            )}
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}>
            <Stack direction="row" flexWrap="wrap" justifyContent="center" spacing={{ xs: 0.5, md: 2 }} useFlexGap sx={{ mb: { xs: 2, md: 3 }, gap: { xs: 0.5, md: 2 } }}>
              {inst.address && (
                <Stack direction="row" spacing={0.5} alignItems="center">
                  <LocationOnIcon sx={{ fontSize: { xs: 14, sm: 20 }, opacity: 0.65 }} />
                  <Typography variant="body2" sx={{ opacity: 0.8, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>{inst.address}</Typography>
                </Stack>
              )}
              {inst.contact_no && (
                <Stack direction="row" spacing={0.5} alignItems="center">
                  <PhoneIcon sx={{ fontSize: { xs: 14, sm: 20 }, opacity: 0.65 }} />
                  <Typography variant="body2" sx={{ opacity: 0.8, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>{inst.contact_no}</Typography>
                </Stack>
              )}
              {inst.email && (
                <Stack direction="row" spacing={0.5} alignItems="center">
                  <EmailIcon sx={{ fontSize: { xs: 14, sm: 20 }, opacity: 0.65 }} />
                  <Typography variant="body2" sx={{ opacity: 0.8, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>{inst.email}</Typography>
                </Stack>
              )}
            </Stack>

            {courses.length > 0 && (
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                justifyContent="center"
                spacing={{ xs: 1, sm: 2 }}
                sx={{ px: { xs: 2, sm: 0 } }}
              >
                <Button variant="contained" size="large" onClick={() => scrollTo('programs')}
                  sx={{
                    bgcolor: 'white', color: '#0d1b4a', fontWeight: 700,
                    borderRadius: 3, px: { xs: 2, sm: 4 }, py: { xs: 1, sm: 1.2 },
                    fontSize: { xs: '0.85rem', sm: '1rem' },
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' },
                  }}
                  startIcon={<DoubleArrowIcon />}>
                  Browse Programs
                </Button>
                <Button variant="outlined" size="large" onClick={() => scrollTo('how-to-apply')}
                  sx={{
                    color: 'white', borderColor: 'rgba(255,255,255,0.4)',
                    borderRadius: 3, px: { xs: 2, sm: 3 }, py: { xs: 1, sm: 1.2 },
                    fontSize: { xs: '0.85rem', sm: '1rem' },
                    '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.08)' },
                  }}>
                  How to Apply
                </Button>
              </Stack>
            )}
          </motion.div>
        </Container>
      </Box>

      {/* ── Stats Strip ── */}
      {courses.length > 0 && (
        <motion.div {...fadeUp}>
          <Container maxWidth="md" sx={{ mt: { xs: -2.5, sm: -3.5 }, mb: { xs: 3, sm: 5 }, position: 'relative', zIndex: 2, px: { xs: 1.5, sm: 2 } }}>
            <Paper elevation={6} sx={{ borderRadius: { xs: 2, sm: 3 }, overflow: 'hidden', border: '1px solid', borderColor: 'divider' }}>
              <Grid container>
                {[
                  { icon: <MenuBookIcon sx={{ fontSize: { xs: 20, sm: 28 } }} />, label: 'Programs', value: courses.length, color: '#1565c0' },
                  { icon: <GroupsIcon sx={{ fontSize: { xs: 20, sm: 28 } }} />, label: 'Active Batches', value: totalBatches, color: '#e65100' },
                  { icon: <WorkspacePremiumIcon sx={{ fontSize: { xs: 20, sm: 28 } }} />, label: 'Total Seats', value: totalCapacity, color: '#2e7d32' },
                ].map((stat, i) => (
                  <Grid item xs={4} key={i}>
                    <StatCard {...stat} borderRight={i < 2} />
                  </Grid>
                ))}
              </Grid>
            </Paper>
          </Container>
        </motion.div>
      )}

      {/* ── Programs ── */}
      <Container maxWidth="lg" sx={{ pb: 2, px: { xs: 1.5, sm: 2 } }} id="programs">
        <motion.div {...fadeUp}>
          <Box sx={{ textAlign: 'center', mb: { xs: 3, sm: 4 } }}>
            <Typography variant="overline" color="primary" fontWeight={700} letterSpacing="0.1em"
              sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
              Our Offerings
            </Typography>
            <Typography variant="h4" fontWeight={800} gutterBottom sx={{ fontSize: { xs: '1.3rem', sm: '2rem' } }}>
              Programs &amp; Batches
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto', fontSize: { xs: '0.85rem', sm: '1rem' }, px: { xs: 1, sm: 0 } }}>
              Choose your desired program and batch below, then click <strong>Apply Now</strong> to start your admission process.
            </Typography>
          </Box>
        </motion.div>

        {courses.length === 0 ? (
          <Paper sx={{ p: { xs: 4, sm: 6 }, textAlign: 'center', borderRadius: 3 }}>
            <SchoolIcon sx={{ fontSize: 56, color: 'text.disabled', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">No programs available at this time.</Typography>
            <Typography variant="body2" color="text.disabled" sx={{ mt: 1 }}>Check back later for new offerings.</Typography>
          </Paper>
        ) : (
          <Grid container spacing={{ xs: 2, sm: 3 }}>
            {courses.map((course, ci) => (
              <Grid item xs={12} md={6} key={course.id}>
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-30px' }}
                  transition={{ duration: 0.45, delay: ci * 0.1 }}
                >
                  <Card elevation={2} sx={{ borderRadius: 3, height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                    <Box sx={{ height: 5, bgcolor: ['#1565c0', '#e65100', '#2e7d32', '#6a1b9a', '#c62828', '#00695c'][ci % 6], borderRadius: '3px 3px 0 0' }} />
                    <CardContent sx={{ flexGrow: 1, p: { xs: 2, sm: 3 }, display: 'flex', flexDirection: 'column' }}>
                      <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 1.5 }}>
                        <Avatar sx={{ width: { xs: 34, sm: 40 }, height: { xs: 34, sm: 40 }, bgcolor: 'primary.main', fontSize: { xs: 15, sm: 18 }, fontWeight: 700 }}>
                          {course.course_name.charAt(0)}
                        </Avatar>
                        <Box sx={{ minWidth: 0 }}>
                          <Typography variant="h6" fontWeight={700} sx={{ lineHeight: 1.3, fontSize: { xs: '0.95rem', sm: '1.25rem' }, wordBreak: 'break-word' }}>
                            {course.course_name}
                          </Typography>
                          {course.project_name && (
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.3, mt: 0.2 }}>
                              <AutoGraphIcon sx={{ fontSize: { xs: 12, sm: 14 } }} /> Project: {course.project_name}
                            </Typography>
                          )}
                        </Box>
                      </Stack>

                      <Stack direction="row" flexWrap="wrap" spacing={0.5} sx={{ mb: 1.5, gap: 0.5 }}>
                        {course.level && <Chip label={`Level ${course.level}`} size="small" color="primary" variant="outlined" sx={{ fontWeight: 600, fontSize: { xs: '0.65rem', sm: '0.75rem' } }} />}
                        {course.venue && <Chip icon={<LocationOnIcon sx={{ fontSize: 14 }} />} label={course.venue} size="small" variant="outlined" sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }} />}
                      </Stack>

                      <Divider sx={{ mb: 1.5 }} />

                      {course.batches && course.batches.length > 0 ? (
                        <>
                          <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 700, fontSize: { xs: '0.65rem', sm: '0.7rem' }, letterSpacing: '0.08em', mb: 1.5 }}>
                            Active Batches ({course.batches.length})
                          </Typography>
                          <Stack spacing={1.5} sx={{ flexGrow: 1 }}>
                            {course.batches.map((batch) => {
                              const fill = batch.capacity > 0 ? ((batch.approved_count ?? 0) / batch.capacity) * 100 : 0;
                              const color = fill >= 100 ? 'error' : fill >= 70 ? 'warning' : 'primary';
                              return (
                                <Paper key={batch.id} variant="outlined" sx={{
                                  p: { xs: 1.5, sm: 2 }, borderRadius: 2, borderColor: 'divider',
                                  '&:hover': { borderColor: 'primary.light', boxShadow: 2 },
                                }}>
                                  <Stack
                                    direction={{ xs: 'column', sm: 'row' }}
                                    justifyContent="space-between"
                                    alignItems={{ xs: 'stretch', sm: 'center' }}
                                    spacing={{ xs: 1, sm: 1.5 }}
                                  >
                                    <Stack direction="row" spacing={1.5} alignItems="center" sx={{ minWidth: 0 }}>
                                      <GroupsIcon sx={{ fontSize: { xs: 18, sm: 24 } }} color="action" />
                                      <Box sx={{ minWidth: 0, flex: 1 }}>
                                        <Typography fontWeight={600} noWrap sx={{ fontSize: { xs: '0.85rem', sm: '0.95rem' }, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                          {batch.name}
                                        </Typography>
                                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
                                          <LinearProgress variant="determinate" value={Math.min(fill, 100)}
                                            sx={{ width: { xs: 70, sm: 90 }, height: { xs: 6, sm: 7 }, borderRadius: 4, bgcolor: 'grey.200' }}
                                            color={color === 'error' ? 'error' : color === 'warning' ? 'warning' : 'primary'}
                                          />
                                          <Typography variant="caption" color="text.secondary" fontWeight={500}>
                                            {batch.approved_count ?? 0}/{batch.capacity}
                                          </Typography>
                                        </Stack>
                                      </Box>
                                    </Stack>
                                    <Button
                                      component="a"
                                      href={`/stp/${slug}/register?course_name=${encodeURIComponent(course.course_name)}&batch_id=${batch.id}`}
                                      size="small"
                                      variant="contained"
                                      startIcon={<HowToRegIcon sx={{ fontSize: { xs: 16, sm: 20 } }} />}
                                      disabled={fill >= 100}
                                      sx={{
                                        fontWeight: 700, borderRadius: 2,
                                        px: { xs: 1.5, sm: 2.5 },
                                        whiteSpace: 'nowrap',
                                        minHeight: { xs: 32, sm: 36 },
                                        fontSize: { xs: '0.8rem', sm: '0.875rem' },
                                      }}
                                    >
                                      {fill >= 100 ? 'Seats Full' : 'Apply Now'}
                                    </Button>
                                  </Stack>
                                </Paper>
                              );
                            })}
                          </Stack>
                        </>
                      ) : (
                        <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Typography variant="body2" color="text.disabled" fontStyle="italic">No active batches right now</Typography>
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>

      {/* ── How to Apply ── */}
      {courses.length > 0 && (
        <Box id="how-to-apply" sx={{ bgcolor: 'white', py: { xs: 4, md: 7 }, mt: 4 }}>
          <Container maxWidth="md">
            <motion.div {...fadeUp}>
              <Box sx={{ textAlign: 'center', mb: { xs: 3, sm: 5 } }}>
                <Typography variant="overline" color="primary" fontWeight={700} letterSpacing="0.1em"
                  sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                  Process
                </Typography>
                <Typography variant="h4" fontWeight={800} gutterBottom sx={{ fontSize: { xs: '1.3rem', sm: '2rem' } }}>
                  How to Apply
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ fontSize: { xs: '0.85rem', sm: '1rem' } }}>
                  Follow these simple steps to join our program
                </Typography>
              </Box>
              <Grid container spacing={{ xs: 1.5, sm: 4 }}>
                {[
                  { step: '01', title: 'Choose a Program', desc: 'Browse our programs above and pick the one that suits your interest.' },
                  { step: '02', title: 'Select Your Batch', desc: 'Choose a batch with available seats that fits your schedule.' },
                  { step: '03', title: 'Fill Online Form', desc: 'Click "Apply Now" and complete the admission form with your details.' },
                  { step: '04', title: 'Submit Documents', desc: 'Upload your photo, signature, and required ID to finalize.' },
                ].map((s, i) => (
                  <Grid item xs={6} md={3} key={i}>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: i * 0.1 }}
                    >
                      <Box sx={{ textAlign: 'center', px: { xs: 0.5, sm: 1 } }}>
                        <Avatar sx={{
                          width: { xs: 44, sm: 60 }, height: { xs: 44, sm: 60 },
                          mx: 'auto', mb: 1,
                          bgcolor: 'primary.main', fontWeight: 800,
                          fontSize: { xs: 16, sm: 20 },
                          boxShadow: '0 4px 14px rgba(21,101,192,0.3)',
                        }}>
                          {s.step}
                        </Avatar>
                        <Typography fontWeight={700} gutterBottom sx={{ fontSize: { xs: '0.8rem', sm: '0.95rem' }, wordBreak: 'break-word' }}>
                          {s.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.82rem' }, lineHeight: { xs: 1.3, sm: 1.5 } }}>
                          {s.desc}
                        </Typography>
                      </Box>
                    </motion.div>
                  </Grid>
                ))}
              </Grid>
            </motion.div>
          </Container>
        </Box>
      )}

      {/* ── Footer ── */}
      <Box id="contact" sx={{ bgcolor: '#0d1b4a', color: 'rgba(255,255,255,0.75)', pt: { xs: 3, md: 5 }, pb: 3 }}>
        <Container maxWidth="lg">
          <Grid container spacing={{ xs: 2, sm: 4 }} sx={{ mb: 3 }}>
            <Grid item xs={12} md={4}>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
                <SchoolIcon sx={{ color: 'white', fontSize: { xs: 22, sm: 28 } }} />
                <Typography variant="h6" fontWeight={700} color="white" sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                  {shortName || inst.name}
                </Typography>
              </Stack>
              <Typography variant="body2" sx={{ lineHeight: 1.7, opacity: 0.7, fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
                Providing quality education and training to build skilled professionals for the future.
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Typography variant="subtitle2" fontWeight={700} color="white" gutterBottom sx={{ fontSize: { xs: '0.85rem', sm: '0.9rem' } }}>
                Quick Links
              </Typography>
              <Stack spacing={0.5}>
                {['Programs', 'How to Apply'].map((l) => (
                  <Button key={l} onClick={() => scrollTo(l === 'Programs' ? 'programs' : 'how-to-apply')}
                    sx={{ color: 'rgba(255,255,255,0.7)', justifyContent: 'flex-start', p: 0, minWidth: 0, fontSize: { xs: '0.8rem', sm: '0.85rem' }, textTransform: 'none', '&:hover': { color: 'white', bgcolor: 'transparent' } }}>
                    {l}
                  </Button>
                ))}
              </Stack>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Typography variant="subtitle2" fontWeight={700} color="white" gutterBottom sx={{ fontSize: { xs: '0.85rem', sm: '0.9rem' } }}>
                Contact
              </Typography>
              <Stack spacing={1}>
                {inst.address && (
                  <Stack direction="row" spacing={1} alignItems="flex-start">
                    <LocationOnIcon sx={{ fontSize: { xs: 16, sm: 20 }, mt: 0.2, opacity: 0.6 }} />
                    <Typography variant="body2" sx={{ opacity: 0.7, fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>{inst.address}</Typography>
                  </Stack>
                )}
                {inst.contact_no && (
                  <Stack direction="row" spacing={1} alignItems="center">
                    <PhoneIcon sx={{ fontSize: { xs: 16, sm: 20 }, opacity: 0.6 }} />
                    <Typography variant="body2" sx={{ opacity: 0.7, fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>{inst.contact_no}</Typography>
                  </Stack>
                )}
                {inst.email && (
                  <Stack direction="row" spacing={1} alignItems="center">
                    <EmailIcon sx={{ fontSize: { xs: 16, sm: 20 }, opacity: 0.6 }} />
                    <Typography variant="body2" sx={{ opacity: 0.7, fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>{inst.email}</Typography>
                  </Stack>
                )}
              </Stack>
            </Grid>
          </Grid>
          <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)', mb: 2 }} />
          <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems="center" spacing={1}>
            <Typography variant="body2" sx={{ opacity: 0.5, fontSize: { xs: '0.7rem', sm: '0.875rem' } }}>
              &copy; {new Date().getFullYear()} {inst.name}. All rights reserved.
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.5, fontSize: { xs: '0.7rem', sm: '0.875rem' } }}>
              Developed by Tarak Rahman
            </Typography>
          </Stack>
        </Container>
      </Box>
    </Box>
  );
}
