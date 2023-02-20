import { useHistory } from 'react-router-dom';
import images from 'src/images';
import styled from 'styled-components';
import Button from 'src/components/Buttons';
import { useState } from 'react';
import { BaseTextInput, InputError } from 'src/baseComponent';
import { NavigationHeader } from 'src/components/NavigationHeader';
import { DivFlex, SecondaryLabel } from 'src/components';
import { useCurrentWallet } from 'src/stores/wallet/hooks';
import { initWalletConnect } from 'src/utils/message';

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

const PageWalletConnect = () => {
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
    console.log(`🚀 !!! ~ code`, code);
    initWalletConnect(code);
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
export default PageWalletConnect;

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
