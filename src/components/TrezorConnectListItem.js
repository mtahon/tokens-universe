import React, { useEffect, useState } from 'react';
import Avatar from '@material-ui/core/Avatar';
import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemText from '@material-ui/core/ListItemText';
import AddIcon from '@material-ui/icons/Add';
import TrezorConnect from 'trezor-connect';

// Define states for the Trezor
const TREZOR_STATES = {
  UNDETERMINED             : 0, // Not sure yet what is the state
  NOT_INITIALIZED          : 1, // Trezor is not initialized
  INITIALIZATION_REQUESTED : 2, // Trezor initialization requested
  INITIALIZED_IDLE         : 3, // Trezor initialized and waiting actions
  INITIALIZATION_FAILED    : 4, // Trenzor intialization failed
  ACCOUNTS_REQUESTED       : 5, // Trezor Accounts have been requested
};

export default function TrezorConnectListItem(props) {

  const {onAccountsRetrieved} = props;

  // Maintain the Trezor states
  const [trezorState, setTrezorState] = useState(TREZOR_STATES.UNDETERMINED);

  // Initialize Trezor Connect
  const updateTrezorState = () => {
    // Check for environment variables
    if(!process.env.REACT_APP_DEVELOPER_EMAIL) {
      throw new Error('Missing REACT_APP_DEVELOPER_EMAIL');
    }
    if(!process.env.REACT_APP_WEBSITE_URL) {
      throw new Error('Missing REACT_APP_WEBSITE_URL');
    }

    // Retrieve the initialization settings
    TrezorConnect.getSettings()
    .then(response => {
      console.log("TrezorConnect.getSettings() =>", response);

      // If success, Trezor Connect is initialized
      if(response.success) {
        console.log('Trezor Connect Initialized')
        setTrezorState(TREZOR_STATES.INITIALIZED_IDLE);
      }
      else {
        console.log(response.payload.error);

        // In case of error, the next action depends on the state
        switch(trezorState) {
          // Undetermined state
          case TREZOR_STATES.UNDETERMINED:
          case TREZOR_STATES.NOT_INITIALIZED: {
            if(response.payload.code === 'Init_NotInitialized') {
              // Initialize the Trezor
              TrezorConnect.init({
                manifest: {
                  email: process.env.REACT_APP_DEVELOPER_EMAIL,
                  appUrl: process.env.REACT_APP_WEBSITE_URL,
                },
                lazyLoad: true,
              })
              .then(() => {
                console.log('Trezor Connect Initialization Requested')
                updateTrezorState();
              })
              .catch(error => {
                console.error(error);
                setTrezorState(TREZOR_STATES.INITIALIZATION_FAILED);
              });

              // Update the state
              setTrezorState(TREZOR_STATES.INITIALIZATION_REQUESTED);
            } 
            else {
              console.warn('Trezor error not implemented')
            }
            break;
          }

          // If initialization was requested but fails, we are not able to initialize it
          case TREZOR_STATES.INITIALIZATION_REQUESTED: {
            setTrezorState(TREZOR_STATES.INITIALIZATION_FAILED);
            console.error('Trezor should have been initialized, are third party cookies allowed?');
            break;
          }

          default:
            console.error('Unexpected state => ', trezorState);
            setTrezorState(TREZOR_STATES.INITIALIZATION_FAILED);

        } // end switch
        
      }
    })
    .catch(error => {
      setTrezorState(TREZOR_STATES.INITIALIZATION_FAILED);
      console.error(error);
    });
  };

  // Update the Trezor State
  const retrieveTrezorAccounts = () => {
    // Prevent attempts before initialization
    if(trezorState !== TREZOR_STATES.INITIALIZED_IDLE) {
      throw new Error('Trezor is not Idle');
    }

    // Retrieve the accounts from device
    setTrezorState(TREZOR_STATES.ACCOUNTS_REQUESTED);
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
        onAccountsRetrieved(trezorAccounts);
      }
    })
    .catch(console.error)
    .finally(() => {
      setTrezorState(TREZOR_STATES.INITIALIZED_IDLE);
    });
  };

  // Connect to Trezor
  const connectTrezor = () => {
    retrieveTrezorAccounts();
  };

  // Initialize Trezor Connect when the component mounts
  useEffect(() => {
    if([
      TREZOR_STATES.UNDETERMINED, 
      TREZOR_STATES.NOT_INITIALIZED,
    ].includes(trezorState)) {
      updateTrezorState();
    }
  });

  // Determine the current action label
  const trezorCurrentActionLabel = () => {
    switch(trezorState) {
      case TREZOR_STATES.UNDETERMINED:
      case TREZOR_STATES.NOT_INITIALIZED:
      case TREZOR_STATES.INITIALIZATION_REQUESTED:
        return 'Initializating..';
      case TREZOR_STATES.INITIALIZED_IDLE:
        return 'Ready';
      case TREZOR_STATES.ACCOUNTS_REQUESTED:
        return 'Retrieving Accounts...';
      case TREZOR_STATES.INITIALIZATION_FAILED:
        return 'Trezor Unavailable';
      default:
        throw new Error('State not implemented');
    }
  };

  return (
    <ListItem autoFocus button onClick={() => connectTrezor()} disabled={trezorState !== TREZOR_STATES.INITIALIZED_IDLE}>
    <ListItemAvatar>
      <Avatar>
        <AddIcon />
      </Avatar>
    </ListItemAvatar>
    <ListItemText primary="Connect Trezor" secondary={trezorCurrentActionLabel()}/>
  </ListItem>
  );
}