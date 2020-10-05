import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Avatar from '@material-ui/core/Avatar';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemText from '@material-ui/core/ListItemText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Dialog from '@material-ui/core/Dialog';
import PersonIcon from '@material-ui/icons/Person';
import { blue } from '@material-ui/core/colors';
import TrezorConnectListItem from './TrezorConnectListItem';
import MetamaskConnectListItem from './MetamaskConnectListItem';

// Map types to labels
const accountOriginLabel = {
  metamask: 'MetaMask',
  trezor: 'Trezor',
};


const useStyles = makeStyles({
  avatar: {
    backgroundColor: blue[100],
    color: blue[600],
  },
});

export default function ConnectWalletDialog(props) {
  const classes = useStyles();
  const { onClose, selectedValue, open } = props;

  // Maintain the list of accounts connected
  const [accounts, setAccounts] = useState([]);

  // Merge accounts, ensuring there is not duplicated address
  const mergeAccounts = (newAccounts) => {
    console.log(" Merging Accounts: ", newAccounts);
    let accountsUpdated = [...accounts, ...newAccounts];
    const indexedAccounts = accountsUpdated.reduce((acc, account) => {
      acc[account.address] = account;
      return acc;
    }, {});

    // Update the state with the updated list
    setAccounts(Object.values(indexedAccounts));
  };

  // Handle closing the dialog
  const handleClose = () => {
    onClose(selectedValue);
  };

  // Handle the selection of an account
  const handleAccountClick = (account) => {
    onClose(account);
  };

  return (
    <Dialog onClose={handleClose} aria-labelledby="simple-dialog-title" open={open}>
      <DialogTitle id="simple-dialog-title">Select Wallet</DialogTitle>
      <List>
        {/* List the accounts */}
        {accounts.map((account) => (
          <ListItem button onClick={() => handleAccountClick(account)} key={account.address}>
            <ListItemAvatar>
              <Avatar className={classes.avatar}>
                <PersonIcon />
              </Avatar>
            </ListItemAvatar>
            <ListItemText primary={account.address} secondary={accountOriginLabel[account.origin]} />
          </ListItem>
        ))}

        <MetamaskConnectListItem onAccountsRetrieved={mergeAccounts}/>
        <TrezorConnectListItem onAccountsRetrieved={mergeAccounts}/>
        

      </List>
    </Dialog>
  );
}
