import React, { useEffect, useState, useRef } from 'react';
import Avatar from '@material-ui/core/Avatar';
import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemText from '@material-ui/core/ListItemText';
import AddIcon from '@material-ui/icons/Add';
import MetaMaskOnboarding from '@metamask/onboarding';

// Define states for Metamask
const METAMASK_STATES = {
  UNDETERMINED             : 0, // Not sure yet what is the state
  INSTALLATION_REQUIRED    : 1, // Metamask is not installed
  INSTALLATION_REQUESTED   : 2, // Metamask is not installed
  INSTALLED_NOT_CONNECTED  : 3, // Metamask is installed but not connected
  INSTALLED_CONNECTED      : 4, // Metamask is installed and connected
  ACCOUNTS_REQUESTED       : 5, // Metamask accounts have been requested
};

export default function MetamaskConnectListItem(props) {

  const { onAccountsRetrieved } = props;
  const onboarding = useRef();
  const [metamaskState, setMetamaskState] = useState(METAMASK_STATES.UNDETERMINED);
  const [accounts, setAccounts] = useState([]);

  useEffect(() => {
    if (!onboarding.current) {
      onboarding.current = new MetaMaskOnboarding();
    }
  }, []);

  useEffect(() => {
    if (MetaMaskOnboarding.isMetaMaskInstalled()) {
      if (accounts.length > 0) {
        setMetamaskState(METAMASK_STATES.INSTALLED_CONNECTED);
        onboarding.current.stopOnboarding();
      } else {
        setMetamaskState(METAMASK_STATES.INSTALLED_NOT_CONNECTED);
      }
    } else {
      setMetamaskState(METAMASK_STATES.INSTALLATION_REQUIRED);
    }
  }, [accounts]);

  useEffect(() => {
    function onAccountsChanged(newAccounts) {
      handleNewAccounts(newAccounts);
    }
    if (MetaMaskOnboarding.isMetaMaskInstalled()) {
      window.ethereum.on('accountsChanged', onAccountsChanged);
      return () => {
        window.ethereum.off('accountsChanged', onAccountsChanged);
      };
    }
  });

  const handleNewAccounts = (newAccounts) => {
    setAccounts(newAccounts);
    onAccountsRetrieved(newAccounts.map(accountAddress => ({
      address: accountAddress,
      origin: 'metamask',
    })));
  }

  const connectMetamask = () => {
    if (MetaMaskOnboarding.isMetaMaskInstalled()) {
      window.ethereum
        .request({ method: 'eth_requestAccounts' })
        .then((newAccounts) => {
          handleNewAccounts(newAccounts);
          setMetamaskState(METAMASK_STATES.INSTALLED_CONNECTED);
        })
        .catch(error => {
          console.error(error);
          setMetamaskState(METAMASK_STATES.INSTALLED_NOT_CONNECTED);
        });
        setMetamaskState(METAMASK_STATES.ACCOUNTS_REQUESTED);
    } else {
      onboarding.current.startOnboarding();
      setMetamaskState(METAMASK_STATES.INSTALLATION_REQUESTED);
    }
  }

  // Determine when the button is enabled
  const isEnabled = [
    METAMASK_STATES.INSTALLATION_REQUIRED,
    METAMASK_STATES.INSTALLED_NOT_CONNECTED,
    METAMASK_STATES.INSTALLED_CONNECTED,
  ].includes(metamaskState);

  // Determine the text shown
  const metamaskCurrentActionLabel = () => {
    switch(metamaskState) {
      case METAMASK_STATES.UNDETERMINED:
        return 'Initializing..';
      case METAMASK_STATES.INSTALLATION_REQUIRED:
        return 'Installation Required';
      case METAMASK_STATES.INSTALLATION_REQUESTED:
        return 'Installing';
      case METAMASK_STATES.INSTALLED_NOT_CONNECTED:
        return 'Ready';
      case METAMASK_STATES.INSTALLED_CONNECTED:
        return 'Connected';
      case METAMASK_STATES.ACCOUNTS_REQUESTED:
        return 'Retrieving Accounts...';
      default:
        throw new Error('Metamask state not implemented');
    }
  };

  return (
    <ListItem autoFocus button onClick={() => connectMetamask()} disabled={!isEnabled}>
    <ListItemAvatar>
      <Avatar>
        <AddIcon />
      </Avatar>
    </ListItemAvatar>
    <ListItemText primary="Connect MetaMask" secondary={metamaskCurrentActionLabel()}/>
  </ListItem>
  );
}