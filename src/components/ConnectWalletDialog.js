import React, { useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Avatar from '@material-ui/core/Avatar';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemText from '@material-ui/core/ListItemText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Dialog from '@material-ui/core/Dialog';
import PersonIcon from '@material-ui/icons/Person';
import AddIcon from '@material-ui/icons/Add';
import { blue } from '@material-ui/core/colors';
import TrezorConnect from 'trezor-connect';


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

  // Maintain the Trezor states
  const [isTrezorInitialized, setIsTrezorInitialized] = useState(false);
  const [isTrezorConnecting, setIsTrezorConnecting] = useState(false);

  // Initialize Trezor Connect
  const initializeTrezor = () => {
    // Retrieve the settings
    TrezorConnect.getSettings()
    .then(response => {
      console.log("TrezorConnect.getSettings() =>", response);

      // If success, Trezor Connect was already initialized
      if(response.success) {
        setIsTrezorInitialized(true);
      }
      else {
        console.log(response.payload.error);
        switch(response.payload.code) {
          case 'Init_ManifestMissing':
          case 'Init_NotInitialized': {
            TrezorConnect.init({
              manifest: {
                email: process.env.REACT_APP_DEVELOPER_EMAIL,
                appUrl: process.env.REACT_APP_WEBSITE_URL,
              },
              lazyLoad: true,
            })
            .then(() => {
              console.log('Trezor Connect Initialized')
              setIsTrezorInitialized(true);
            })
            .catch(console.error);
            break;
          }

          default:
            console.warn('Error Code not implemented => ', response.payload.code);
        }
      }
    })
    .catch(console.error);
  };

  // Merge accounts, ensuring there is not duplicated address
  const mergeAccounts = (newAccounts) => {
    let accountsUpdated = accounts;

    // Check for each account if we can add it
    newAccounts.forEach(newAccount => {
      // If account address is not found, account is added
      if(!accounts.find(account => account.address === newAccount.address)) {
        accountsUpdated.push(newAccount);
      }      
    });

    // Update the state with the updated list
    setAccounts(accountsUpdated);
  };

  // Update the Trezor State
  const retrieveTrezorAccounts = () => {
    // Prevent attempts before initialization
    if(!isTrezorInitialized) {
      throw new Error('Trezor not initialized');
    }

    // Retrieve the accounts from device
    setIsTrezorConnecting(true);
    TrezorConnect.ethereumGetAddress({
      bundle: [
          { path: "m/44'/60'/0'/0/0", showOnTrezor: false }, // account 1
          { path: "m/44'/60'/1'/0/0", showOnTrezor: false }, // account 2
          { path: "m/44'/60'/2'/0/0", showOnTrezor: false }  // account 3
      ]
    })
    .then(response => {
      console.log("TrezorConnect.ethereumGetAddress() => ", response)
      if(response.success) {
        const trezorAccounts = response.payload.map(({address}) => ({
          address: address,
          origin: 'trezor',
        }));
        console.log('trezorAccounts => ', trezorAccounts);
        mergeAccounts(trezorAccounts);
      }
    })
    .catch(console.error)
    .finally(() => {
      setIsTrezorConnecting(false);
    });
  };

  // Connect to Trezor
  const connectTrezor = () => {
    retrieveTrezorAccounts();
  };

  // Handle closing the dialog
  const handleClose = () => {
    onClose(selectedValue);
  };

  // Handle the selection of an account
  const handleAccountClick = (account) => {
    onClose(account);
  };

  // Initialize Trezor Connect when the component mounts
  useEffect(() => {
    initializeTrezor();
  },[isTrezorInitialized]);

  return (
    <Dialog onClose={handleClose} aria-labelledby="simple-dialog-title" open={open}>
      <DialogTitle id="simple-dialog-title">Select Wallet</DialogTitle>
      <List>
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

        <ListItem autoFocus button onClick={() => connectTrezor()} disabled={!isTrezorInitialized}>
          <ListItemAvatar>
            <Avatar>
              <AddIcon />
            </Avatar>
          </ListItemAvatar>
          <ListItemText primary={isTrezorConnecting ? "Connecting... " : "Connect Trezor"}/>
        </ListItem>
      </List>
    </Dialog>
  );
}
