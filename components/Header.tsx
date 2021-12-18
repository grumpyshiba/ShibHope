import { useWeb3React } from '@web3-react/core';
import { Button, HStack, Link, Menu, Popover, Text } from 'native-base';
import { InjectedConnector } from '@web3-react/injected-connector';
import GrumpyShibaAbi from 'contracts/GrumpyShibaAbi.json';
import React, { useEffect, useState } from 'react';
import Logo from './Logo';
import type Web3 from 'web3';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(r => r.json());

const injected = new InjectedConnector({
  supportedChainIds: [1, 3, 4, 5, 42, 56],
});

const Header: React.FC = () => {
  const { active, account, library, activate, deactivate } = useWeb3React();
  const [ balance, setBalance ] = useState<number | undefined>(undefined);
  const { data: { data: { price } } = { data: { price: 0 } } } = useSWR('https://api.pancakeswap.info/api/v2/tokens/0xAe448cB5A3ec77BA4aDcc6C8f9621e5921DCd77a', fetcher);
  
  const web3: Web3 = library;

  useEffect(() => {
    injected.isAuthorized().then((isAuthorized) => {
      if (isAuthorized) {
        activate(injected);
      }
    });
  }, []);

  const handleConnect = async () => {
    activate(injected);
  };

  const handleDisconnect = async () => {
    deactivate();
  };

  useEffect(() => {
    if (web3) {
      const contract = new web3.eth.Contract(GrumpyShibaAbi as any, '0xAe448cB5A3ec77BA4aDcc6C8f9621e5921DCd77a');
      contract.methods.balanceOf(account).call().then((balance: number) => {
        setBalance(balance);
      });
    }
  }, [web3]);

  return (
    <HStack bg="white" shadow={5} space={2} py={6} px={10} justifyContent="center">
      <Link flex={1} href="/">
        <Logo flex={1} />
      </Link>
      {!active ? (
        <Button
          p={0}
          rounded="100px"
          _stack={{
            px: 4,
            py: 2,
            rounded: '100px',
            height: '100%',
            bg: {
              linearGradient: {
                colors: ["#9D50F1", "#6573FC"],
                start: [0, 0],
                end: [1, 0],
              },
            }
          }}
          _text={{
            fontSize: "md",
            fontWeight: "bold",
            color: "white",
          }}
          onPress={handleConnect}
        >
          Connect Wallet
        </Button>
      ) : (
        <Popover trigger={(triggerProps) => (
          <Button _text={ { numberOfLines: 1, maxW: '150px' } } variant="outline" {...triggerProps}>
            {account}
          </Button>
        )}>
          <Popover.Content p={4} accessibilityLabel="Delete Customerd" w="56">
            <Popover.Arrow />
            {balance && (
              <>
                <Text fontSize="8px" fontWeight="bold">{`${(balance / Math.pow(10, 18))} GRUMPYSHIB`}</Text>
                <Text mt={1} color="gray.600" fontSize="8px">≈{(price * balance / Math.pow(10, 18)).toFixed(2)}</Text>
              </>
            )}
            <Button mt={4} onPress={handleDisconnect}>Disconnect</Button>
          </Popover.Content>
        </Popover>
      )}
    </HStack>
  );
};

export default Header;
