import React, { useState } from 'react';
import {
  Paper,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActionArea,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  LinearProgress,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tooltip,
} from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import TipsAndUpdatesIcon from '@mui/icons-material/TipsAndUpdates';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import { alpha } from '@mui/material/styles';

const articles = [
  {
    id: 1,
    title: 'Understanding Emergency Funds',
    category: 'Basics',
    description: 'Learn why emergency funds are crucial and how to build one.',
    image: 'https://source.unsplash.com/random/400x200?money',
    readTime: '5 min',
    difficulty: 'Beginner',
    content: `An emergency fund is a financial safety net that helps you deal with unexpected expenses...`,
    tips: [
      'Start with a goal of saving $1,000',
      'Aim to save 3-6 months of expenses',
      'Keep the money easily accessible',
      'Use a high-yield savings account',
    ],
  },
  {
    id: 2,
    title: 'Investment Basics: Getting Started',
    category: 'Investing',
    description: 'A beginner's guide to understanding investment options.',
    image: 'https://source.unsplash.com/random/400x200?investing',
    readTime: '8 min',
    difficulty: 'Intermediate',
    content: `Understanding the basics of investing is crucial for building long-term wealth...`,
    tips: [
      'Start with low-cost index funds',
      'Diversify your portfolio',
      'Invest regularly through dollar-cost averaging',
      'Reinvest dividends',
    ],
  },
  // Add more articles...
];

const courses = [
  {
    id: 1,
    title: 'Personal Finance 101',
    description: 'Master the basics of personal finance management',
    modules: [
      {
        title: 'Budgeting Basics',
        completed: true,
        duration: '30 min',
      },
      {
        title: 'Saving Strategies',
        completed: true,
        duration: '45 min',
      },
      {
        title: 'Debt Management',
        completed: false,
        duration: '40 min',
      },
      {
        title: 'Investment Fundamentals',
        completed: false,
        duration: '60 min',
      },
    ],
    progress: 50,
  },
  {
    id: 2,
    title: 'Advanced Investing',
    description: 'Learn advanced investment strategies and portfolio management',
    modules: [
      {
        title: 'Asset Allocation',
        completed: false,
        duration: '45 min',
      },
      {
        title: 'Risk Management',
        completed: false,
        duration: '50 min',
      },
      {
        title: 'Tax Strategies',
        completed: false,
        duration: '40 min',
      },
    ],
    progress: 0,
  },
  // Add more courses...
];

const dailyTips = [
  {
    id: 1,
    title: '50/30/20 Budget Rule',
    description: 'Allocate 50% of income to needs, 30% to wants, and 20% to savings.',
    category: 'Budgeting',
  },
  {
    id: 2,
    title: 'Pay Yourself First',
    description: 'Set aside savings as soon as you receive income.',
    category: 'Saving',
  },
  // Add more tips...
];

export default function FinancialEducation() {
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [bookmarkedArticles, setBookmarkedArticles] = useState([]);
  const [expandedCourse, setExpandedCourse] = useState(null);

  const handleBookmark = (articleId) => {
    setBookmarkedArticles(prev =>
      prev.includes(articleId)
        ? prev.filter(id => id !== articleId)
        : [...prev, articleId]
    );
  };

  const ArticleDialog = ({ article, onClose }) => (
    <Dialog
      open={Boolean(article)}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      scroll="paper"
    >
      {article && (
        <>
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="h6">{article.title}</Typography>
              <IconButton onClick={() => handleBookmark(article.id)}>
                {bookmarkedArticles.includes(article.id) ? (
                  <BookmarkIcon color="primary" />
                ) : (
                  <BookmarkBorderIcon />
                )}
              </IconButton>
            </Box>
          </DialogTitle>
          <DialogContent dividers>
            <Box sx={{ mb: 2 }}>
              <CardMedia
                component="img"
                height="200"
                image={article.image}
                alt={article.title}
                sx={{ borderRadius: 1 }}
              />
            </Box>
            <Typography variant="body1" paragraph>
              {article.content}
            </Typography>
            <Typography variant="h6" gutterBottom>
              Key Takeaways
            </Typography>
            <List>
              {article.tips.map((tip, index) => (
                <ListItem key={index}>
                  <ListItemIcon>
                    <TipsAndUpdatesIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText primary={tip} />
                </ListItem>
              ))}
            </List>
          </DialogContent>
          <DialogActions>
            <Button onClick={onClose}>Close</Button>
          </DialogActions>
        </>
      )}
    </Dialog>
  );

  return (
    <Box sx={{ mb: 4 }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <SchoolIcon sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="h6" sx={{ color: 'text.secondary' }}>
              Financial Education Center
            </Typography>
          </Box>
        </Grid>

        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>
            Featured Articles
          </Typography>
          <Grid container spacing={2}>
            {articles.map(article => (
              <Grid item xs={12} sm={6} md={4} key={article.id}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'transform 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                    },
                  }}
                >
                  <CardActionArea onClick={() => setSelectedArticle(article)}>
                    <CardMedia
                      component="img"
                      height="140"
                      image={article.image}
                      alt={article.title}
                    />
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Chip
                          label={article.category}
                          size="small"
                          sx={{ bgcolor: alpha('#2196f3', 0.1), color: 'primary.main' }}
                        />
                        <Typography variant="caption" color="text.secondary">
                          {article.readTime} read
                        </Typography>
                      </Box>
                      <Typography variant="h6" gutterBottom>
                        {article.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {article.description}
                      </Typography>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Grid>

        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>
            Learning Paths
          </Typography>
          {courses.map(course => (
            <Accordion
              key={course.id}
              expanded={expandedCourse === course.id}
              onChange={() => setExpandedCourse(expandedCourse === course.id ? null : course.id)}
              sx={{ mb: 2 }}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle1">{course.title}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {course.description}
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={course.progress}
                    sx={{
                      mt: 1,
                      height: 6,
                      borderRadius: 3,
                      bgcolor: alpha('#2196f3', 0.1),
                      '& .MuiLinearProgress-bar': {
                        borderRadius: 3,
                      },
                    }}
                  />
                </Box>
                <Box sx={{ ml: 2, textAlign: 'right' }}>
                  <Typography variant="h6" color="primary">
                    {course.progress}%
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Complete
                  </Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <List>
                  {course.modules.map((module, index) => (
                    <ListItem key={index}>
                      <ListItemIcon>
                        {module.completed ? (
                          <CheckCircleIcon color="success" />
                        ) : (
                          <PlayCircleOutlineIcon color="primary" />
                        )}
                      </ListItemIcon>
                      <ListItemText
                        primary={module.title}
                        secondary={`Duration: ${module.duration}`}
                      />
                      {!module.completed && (
                        <Button variant="outlined" size="small">
                          Start
                        </Button>
                      )}
                    </ListItem>
                  ))}
                </List>
              </AccordionDetails>
            </Accordion>
          ))}
        </Grid>

        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>
            Daily Financial Tips
          </Typography>
          <Alert
            severity="info"
            icon={<TipsAndUpdatesIcon />}
            sx={{
              mb: 2,
              '& .MuiAlert-message': {
                width: '100%',
              },
            }}
          >
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              {dailyTips.map(tip => (
                <Card
                  key={tip.id}
                  sx={{
                    flex: 1,
                    minWidth: 250,
                    bgcolor: 'background.paper',
                  }}
                >
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom>
                      {tip.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {tip.description}
                    </Typography>
                    <Chip
                      label={tip.category}
                      size="small"
                      sx={{
                        mt: 1,
                        bgcolor: alpha('#2196f3', 0.1),
                        color: 'primary.main',
                      }}
                    />
                  </CardContent>
                </Card>
              ))}
            </Box>
          </Alert>
        </Grid>
      </Grid>

      <ArticleDialog
        article={selectedArticle}
        onClose={() => setSelectedArticle(null)}
      />
    </Box>
  );
}