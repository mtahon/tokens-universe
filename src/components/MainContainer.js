import React from 'react';
import CssBaseline from '@material-ui/core/CssBaseline';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Container from '@material-ui/core/Container';
import MenuBar from './MenuBar';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';

const useStyles = makeStyles((theme) => ({
  root: {
    backgroundColor: '#cfe8fc',
    height: '100vh',
  },
  gridContainer: {},
  paper: {
    padding: theme.spacing(2),
    textAlign: 'center',
    color: theme.palette.text.secondary,
  },
  menuBarItem: {
    flexGrow: 0,
  },
  centralItem: {
    flexGrow: 1,
    padding: theme.spacing(2),
  },
}));

export default function MainContainer() {
  const classes = useStyles();
  return (
    <React.Fragment>
      <CssBaseline />
      <Container maxWidth="md">
        
        <Typography component="div" className={classes.root}>
          <Grid container spacing={0} className={classes.gridContainer}>
            <Grid item xs={12} className={classes.menuBarItem}>
              <MenuBar/>
            </Grid>
            <Grid item xs={12} className={classes.centralItem}>
              <Button variant="contained" color="secondary">
                Connect Wallet
              </Button>
            </Grid>            
          </Grid>
        </Typography>
      </Container>
    </React.Fragment>
  );
}