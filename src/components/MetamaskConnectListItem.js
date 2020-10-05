import React, { useEffect, useState } from 'react';
import Avatar from '@material-ui/core/Avatar';
import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemText from '@material-ui/core/ListItemText';
import AddIcon from '@material-ui/icons/Add';

export default function TrezorConnectListItem(props) {

  const {onAccountsRetrieved} = props;

  const connectMetamask = () => {
    console.info('Connect Metamask')
  }

  return (
    <ListItem autoFocus button onClick={() => connectMetamask()}>
    <ListItemAvatar>
      <Avatar>
        <AddIcon />
      </Avatar>
    </ListItemAvatar>
    <ListItemText primary="Connect MetaMask"/>
  </ListItem>
  );
}