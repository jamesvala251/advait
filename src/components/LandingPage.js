import React from 'react';
import { Box, Button, Container, Typography, Grid, Paper, List, ListItem, ListItemText } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import SecurityIcon from '@mui/icons-material/Security';
import SpeedIcon from '@mui/icons-material/Speed';
import IntegrationInstructionsIcon from '@mui/icons-material/IntegrationInstructions';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import GroupsIcon from '@mui/icons-material/Groups';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import HandshakeIcon from '@mui/icons-material/Handshake';
import BuildIcon from '@mui/icons-material/Build';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PhoneIcon from '@mui/icons-material/Phone';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import FacebookIcon from '@mui/icons-material/Facebook';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import EmailIcon from '@mui/icons-material/Email';

const LandingPage = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <SpeedIcon sx={{ fontSize: 40, color: '#1976d2' }} />,
      title: "FASTEST GOODS DELIVERY",
      description: "Offers economically efficient & time bound transportation with seamless connectivity through a dedicated fleet of vehicle & trusted partners."
    },
    {
      icon: <SupportAgentIcon sx={{ fontSize: 40, color: '#1976d2' }} />,
      title: "24/7 ON-CALL SUPPORT",
      description: "Our 24x7 on-call support provides quality services to our concerned customers at anytime. Give us a call using one of the phone numbers."
    },
    {
      icon: <IntegrationInstructionsIcon sx={{ fontSize: 40, color: '#1976d2' }} />,
      title: "END-TO-END SOLUTIONS",
      description: "Provide End-to-End solutions for clients transport & logistics needs under one roof, improving their business efficiencies and productivity."
    },
    {
      icon: <SecurityIcon sx={{ fontSize: 40, color: '#1976d2' }} />,
      title: "SAFETY & COMPLIANCE",
      description: "We are an ISO 9001:2008 Certified company. Safety and compliance policies & procedures that inspire corporate and individual excellence."
    }
  ];

  // Add values with icons
  const values = [
    { label: 'Commitments', icon: <EmojiEventsIcon sx={{ fontSize: 40, color: '#1976d2' }} /> },
    { label: 'Ownership', icon: <VerifiedUserIcon sx={{ fontSize: 40, color: '#1976d2' }} /> },
    { label: 'Teamwork', icon: <GroupsIcon sx={{ fontSize: 40, color: '#1976d2' }} /> },
    { label: 'Innovation', icon: <LightbulbIcon sx={{ fontSize: 40, color: '#1976d2' }} /> },
    { label: 'Integrity', icon: <HandshakeIcon sx={{ fontSize: 40, color: '#1976d2' }} /> },
    { label: 'Relationship Building', icon: <BuildIcon sx={{ fontSize: 40, color: '#1976d2' }} /> },
    { label: 'Flexibility', icon: <CompareArrowsIcon sx={{ fontSize: 40, color: '#1976d2' }} /> },
  ];

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* Hero Section */}
      <Box
        sx={{
          bgcolor: '#1a237e',
          color: 'white',
          py: 8,
          backgroundImage: 'linear-gradient(45deg, #1a237e 30%, #283593 90%)',
        }}
      >
        <Container>
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="h2" component="h1" gutterBottom>
                ADVAIT ROAD MOVERS
              </Typography>
              <Typography variant="h5" paragraph>
                India's leading integrated logistics & Transportation Service Provider
              </Typography>
              <Button
                variant="contained"
                size="large"
                sx={{
                  mt: 3,
                  bgcolor: '#fff',
                  color: '#1a237e',
                  '&:hover': {
                    bgcolor: '#e0e0e0',
                  }
                }}
                onClick={() => navigate('/login')}
              >
                Login to Dashboard
              </Button>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box
                component="img"
                src="/logo.jpg"
                alt="Advait Road Movers Logo"
                sx={{
                  width: '100%',
                  maxWidth: 400,
                  height: 'auto',
                  display: 'block',
                  margin: 'auto',
                  filter: 'brightness(1.1)',
                  boxShadow: 3
                }}
              />
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Container sx={{ py: 8 }}>
        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Paper
                elevation={3}
                sx={{
                  p: 3,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'translateY(-5px)'
                  }
                }}
              >
                {feature.icon}
                <Typography variant="h6" component="h3" sx={{ my: 2 }}>
                  {feature.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {feature.description}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* About Section */}
      <Box sx={{ bgcolor: '#f5f5f5', py: 8 }}>
        <Container>
          <Typography variant="h4" component="h2" gutterBottom align="center" sx={{ mb: 4 }}>
            About Us
          </Typography>
          <Typography variant="body1" paragraph>
            ADVAIT ROAD MOVERS was incorporated with the aim to meet the requirement of the Cement industries firm with the view to perform the role of service to the logistic department and complete customer service for transportation solution.
          </Typography>
          <Typography variant="body1" paragraph>
            We lift around 6000 Tons monthly cement Loose and pack from Wonder Cement. Currently, we are serving the transportation of cement to Wonder Cement Private Limited, Also we are serving to Ambuja Cement, Ultratech cement as sub Transporter.
          </Typography>
        </Container>
      </Box>

      {/* Values Section */}
      <Box sx={{ bgcolor: '#e3f2fd', py: 8 }}>
        <Container>
          <Typography variant="h4" component="h2" gutterBottom align="center" sx={{ mb: 4, fontWeight: 700 }}>
            Our Values
          </Typography>
          <Grid container spacing={4} justifyContent="center" alignItems="center">
            {values.map((value, idx) => (
              <Grid item xs={6} sm={4} md={3} key={value.label} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Box
                  sx={{
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    bgcolor: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: 2,
                    mb: 2,
                    transition: 'transform 0.2s, box-shadow 0.2s, background 0.2s',
                    '&:hover': {
                      transform: 'scale(1.08)',
                      boxShadow: 6,
                      bgcolor: '#bbdefb',
                    },
                  }}
                >
                  {value.icon}
                </Box>
                <Typography variant="subtitle1" sx={{ color: '#1565c0', fontWeight: 600, textAlign: 'center' }}>
                  {value.label}
                </Typography>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Contact Section (Footer) */}
      <Box sx={{ bgcolor: '#1565c0', color: 'white', py: 4, mt: 8 }}>
        <Container maxWidth="md">
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: 'center', justifyContent: 'center', gap: 4, mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: { xs: 2, sm: 0 } }}>
              <LocationOnIcon sx={{ mr: 1 }} />
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                B74 Park Plush Nr. Kanha Galaxy Khatamba Vaghodiya Road Vadodara 390019
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <PhoneIcon sx={{ mr: 1 }} />
              <Typography variant="body1" sx={{ fontWeight: 500, mr: 2 }}>
                <a href="tel:9277101001" style={{ color: 'inherit', textDecoration: 'none' }}>Mo-9277101001</a>
              </Typography>
              <EmailIcon sx={{ mr: 1 }} />
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                <a href="mailto:info@advaitroadmovers.com" style={{ color: 'inherit', textDecoration: 'none' }}>info@advaitroadmovers.com</a>
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3, mb: 2 }}>
            <a href="https://www.linkedin.com/" target="_blank" rel="noopener noreferrer" style={{ color: '#fff' }}><LinkedInIcon fontSize="large" /></a>
            <a href="https://www.facebook.com/" target="_blank" rel="noopener noreferrer" style={{ color: '#fff' }}><FacebookIcon fontSize="large" /></a>
            <a href="https://wa.me/919277101001" target="_blank" rel="noopener noreferrer" style={{ color: '#fff' }}><WhatsAppIcon fontSize="large" /></a>
          </Box>
          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <Typography variant="body2" sx={{ fontWeight: 400 }}>
              Developed By{' '}
              <a href="https://techinclusive.com/" target="_blank" rel="noopener noreferrer" style={{ color: '#fff', textDecoration: 'underline', fontWeight: 600 }}>
                Tech Inclusive
              </a>
            </Typography>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default LandingPage; 