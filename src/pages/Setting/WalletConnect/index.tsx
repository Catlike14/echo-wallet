import { useHistory } from 'react-router-dom';
import SignClient from '@walletconnect/sign-client';
import { parseUri } from '@walletconnect/utils';
import images from 'src/images';
import styled from 'styled-components';
import Button from 'src/components/Buttons';
import { useState } from 'react';
import { BaseTextInput, InputError } from 'src/baseComponent';
import { NavigationHeader } from 'src/components/NavigationHeader';
import { DivFlex, SecondaryLabel } from 'src/components';
import { useCurrentWallet } from 'src/stores/wallet/hooks';

const Body = styled.div`
  height: 170px;
`;

const Wrapper = styled.div`
  padding: 0 20px;

  font-size: 16px;
  word-break: break-word;
`;

export const SPWrapper = styled.div`
  padding: 16px;
  font-size: 16px;
  position: relative;
  box-shadow: 0px 167px 67px rgba(36, 8, 43, 0.01), 0px 94px 57px rgba(36, 8, 43, 0.03), 0px 42px 42px rgba(36, 8, 43, 0.06),
    0px 10px 23px rgba(36, 8, 43, 0.06), 0px 0px 0px rgba(36, 8, 43, 0.07);
  border-radius: 25px;
  box-sizing: border-box;
  text-align: center;
`;

const LockImage = styled.img`
  width: 28px;
  height: 35px;
`;

const CustomButton = styled.div`
  margin-top: 20px;
`;

const DivError = styled.div`
  margin-top: 10px;
`;

const WalletConnect = () => {
  const history = useHistory();
  const [code, setCode] = useState('');
  const [isErrorEmpty, setErrorEmpty] = useState(false);
  const [isErrorVerify, setErrorVerify] = useState(false);
  const { account } = useCurrentWallet();

  const goBack = () => {
    history.goBack();
  };

  const onChangeInput = (e) => {
    setCode(e.target.value);
  };

  const handleConfirmCode = async () => {
    // const authClient = await AuthClient.init({
    //   projectId: '<YOUR_PROJECT_ID>',
    //   metadata: {
    //     name: 'my-auth-dapp',
    //     description: 'A dapp using WalletConnect AuthClient',
    //     url: 'my-auth-dapp.com',
    //     icons: ['https://my-auth-dapp.com/icons/logo.png'],
    //   },
    // });
    console.log(`🚀 !!! ~ code`, code);
    console.log(`🚀 !!! ~ parseUri`, parseUri(code));

    const signClient = await SignClient.init({
      projectId: process.env.REACT_APP_WALLET_CONNECT_PROJECT_ID,
      relayUrl: process.env.REACT_APP_WALLET_CONNECT_RELAY_URL,
      metadata: {
        name: 'Kaddex SWAP',
        description: 'Swap for KDA and KDX',
        url: 'https://swap.kaddex.com/',
        icons: ['https://kaddex.com/Kaddex_icon.png'],
      },
    });
    const pair = await signClient.core.pairing.pair({ uri: code });
    console.log(`🚀 !!! ~ pair`, pair);
    signClient.on('session_proposal', async (event) => {
      console.log(`🚀 !!! ~ session_proposal event`, event);
      const KDA_NETWORK_PREFIXES = ['kadena:mainnet01', 'kadena:testnet04', 'kadena:development'];
      const accounts = [
        `${KDA_NETWORK_PREFIXES[0]}:${account.replace(':', '**')}`,
        `${KDA_NETWORK_PREFIXES[1]}:${account.replace(':', '**')}`,
        `${KDA_NETWORK_PREFIXES[2]}:${account.replace(':', '**')}`,
      ];
      const { topic, acknowledged } = await signClient.approve({
        id: event.id,
        namespaces: {
          kadena: {
            accounts,
            methods: ['kadena_sign', 'kadena_quicksign'],
            events: ['kadena_transaction_updated'],
            extension: [
              {
                accounts,
                methods: ['kaddex_sign', 'kaddex_send_transaction', 'kaddex_sign_transaction'],
                events: ['account_changed', 'chain_id_changed'],
              },
            ],
          },
        },
      });
    });

    // const a = signClient.pair({ uri: code });
    // console.log(`🚀 !!! ~ a`, a);
    // console.log(`🚀 !!! ~ signClient`, signClient);
  };

  return (
    <Wrapper>
      <NavigationHeader title="Wallet Connect" onBack={goBack} />
      <DivFlex flexDirection="column" justifyContent="center" alignItems="center" padding="50px 0px">
        <LockImage src={images.settings.iconLockOpen} alt="lock" />
        <SecondaryLabel fontWeight={500}>Enter DAPP Wallet Connect code</SecondaryLabel>
      </DivFlex>
      <Body>
        <BaseTextInput
          inputProps={{ placeholder: 'Input uri' }}
          title="Code"
          height="auto"
          onChange={onChangeInput}
          onKeyPress={(event) => {
            if (event.key === 'Enter') {
              handleConfirmCode();
            }
          }}
        />
        <DivError>
          {isErrorEmpty && <InputError marginTop="0">This field is required.</InputError>}
          {isErrorVerify && <InputError marginTop="0">Invalid code</InputError>}
        </DivError>
        <CustomButton>
          <Button size="full" variant="primary" onClick={handleConfirmCode} isDisabled={!code} label="Continue" />
        </CustomButton>
      </Body>
    </Wrapper>
  );
};
export default WalletConnect;

const namespaceExample = {
  kadena: {
    accounts: [
      'kadena:mainnet01:k**2e6..........................4940e',
      'kadena:testnet04:k**2e6..........................4940e',
      'kadena:development:k**2e6..........................4940e',
    ],
    methods: ['kadena_sign', 'kadena_quicksign'],
    events: ['kadena_transaction_updated'],
    extension: [
      {
        accounts: [
          'kadena:mainnet01:k**2e6..........................4940e',
          'kadena:testnet04:k**2e6..........................4940e',
          'kadena:development:k**2e6..........................4940e',
        ],
        methods: ['kaddex_sign', 'kaddex_send_transaction', 'kaddex_sign_transaction'],
        events: ['account_changed', 'chain_id_changed'],
      },
    ],
  },
};
