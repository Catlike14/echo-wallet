import { useState, useEffect, useContext } from 'react';
import styled from 'styled-components';
import images from 'src/images';
import { fetchListLocal, getBalanceFromChainwebApiResponse } from 'src/utils/chainweb';
import ReactLoading from 'react-loading';
import { useSelector } from 'react-redux';
import { hideLoading } from 'src/stores/extensions';
import { setBalance, setCurrentWallet, setWallets } from 'src/stores/wallet';
import { getLocalPassword, getLocalWallets, setLocalSelectedWallet, setLocalWallets } from 'src/utils/storage';
import { encryptKey } from 'src/utils/security';
import { CHAIN_COUNT } from 'src/utils/constant';
import { TxSettingsContext } from 'src/contexts/TxSettingsContext';

const Div = styled.div`
  margin: auto 0;
  font-size: ${(props) => props.fontSize};
  margin-right: ${(props) => props.marginRight};
  text-align: ${(props) => props.textAlign};
`;

const TitleChain = styled.div`
  padding: 15px 0;
  font-size: 16px;
  font-weight: 700;
  border-bottom: 1px solid rgba(255, 255, 255, 0.5);
`;

const LoadingWrapper = styled.div`
  display: flex;
  justify-content: center;
  margin: 20px 0;
`;

const DivFlex = styled.div`
  display: flex;
  justify-content: ${(props) => props.justifyContent};
  margin-bottom: ${(props) => props.marginBottom};
`;

const Image = styled.img<{ size: string; top: string; width: string }>`
  height: ${($props) => $props.size};
  width: ${($props) => ($props.width ? $props.width : $props.size)};
  margin: auto;
`;
const SelectChainContent = styled.div`
  padding: 15px;
  text-align: left;
  max-height: 200px;
`;
const ChainOption = styled(DivFlex)`
  margin-bottom: 20px;
  cursor: pointer;
  padding-bottom: ${(props) => props.paddingBottom};
`;
const ChainName = styled.div`
  margin-left: 10px;
`;
const DivChild = styled.div`
  font-size: ${(props) => props.fontSize};
  color: ${(props) => props.color};
  margin-top: ${(props) => props.marginTop};
  margin-left: ${(props) => props.marginLeft};
  margin-right: ${(props) => props.marginRight};
  margin-bottom: ${(props) => props.marginBottom};
  font-weight: ${(props) => props.fontWeight};
`;

const ChainDropdown = () => {
  const [listChain, setListChain] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { data: txSettings } = useContext(TxSettingsContext);
  const rootState = useSelector((state) => state);
  const { selectedNetwork } = rootState.extensions;
  const { wallet } = rootState;
  useEffect(() => {
    setIsLoading(true);
    const { account, publicKey, secretKey } = wallet;
    let listChainSelected = wallet.wallets.filter((item: any) => item?.account === wallet?.account);
    if (account.includes('k:') && account.length === 66) {
      const newSelected: any = [];
      for (let i = 0; i < CHAIN_COUNT; i += 1) {
        const itemExist = listChainSelected.find((item) => item.chainId.toString() === i.toString());
        if (itemExist) {
          newSelected.push(itemExist);
        } else {
          newSelected.push({
            chainId: i.toString(),
            account,
            publicKey,
            secretKey,
            connectedSites: [],
          });
        }
      }
      listChainSelected = newSelected;
    }
    let listChainId = listChainSelected.map((item: any) => ({
      ...item,
      // eslint-disable-next-line no-nested-ternary
      balance: item?.balance ? item?.balance : item?.chainId === wallet?.chainId ? wallet?.balance : 0,
    }));
    listChainId.sort(compare);
    const code = `(coin.details "${wallet.account}")`;
    const promiseList: any[] = [];
    for (let i = 0; i < listChainId?.length; i += 1) {
      const item = fetchListLocal(
        code,
        selectedNetwork.url,
        selectedNetwork.networkId,
        listChainId[i]?.chainId,
        txSettings?.gasPrice,
        txSettings?.gasLimit,
      );
      promiseList.push(item);
    }
    Promise.all(promiseList)
      .then((res) => {
        const data = listChainId.map((item, key) => ({
          ...item,
          balance: getBalanceFromChainwebApiResponse(res[key]),
        }));
        listChainId = data;
        listChainId.sort(compare);
        setListChain(listChainId);
        hideLoading();
        setIsLoading(false);
      })
      .catch(() => {
        hideLoading();
        setIsLoading(false);
        setListChain(listChainId);
      });
  }, [selectedNetwork?.networkId, wallet?.account]);
  const compare = (a, b) => {
    if (Number(a?.chainId) < Number(b?.chainId)) {
      return -1;
    }
    if (Number(a?.chainId) > Number(b?.chainId)) {
      return 1;
    }
    return 0;
  };

  const changeExistWallet = (newAccount, balance) => {
    const { chainId, account, publicKey, secretKey } = newAccount;
    getLocalPassword(
      (accountPassword) => {
        const newWallet = {
          account: encryptKey(account, accountPassword),
          publicKey: encryptKey(publicKey, accountPassword),
          secretKey: encryptKey(secretKey, accountPassword),
          chainId,
          connectedSites: newAccount.connectedSites || [],
        };
        setLocalSelectedWallet(newWallet);
        setCurrentWallet(newAccount);
        setBalance(balance);
        const itemExist = wallet.wallets.find((item) => item.chainId.toString() === chainId.toString() && account === item.account);
        if (!itemExist) {
          getLocalWallets(
            selectedNetwork.networkId,
            (item) => {
              const newData = [...item, newWallet];
              setLocalWallets(selectedNetwork.networkId, newData);
            },
            () => {
              setLocalWallets(selectedNetwork.networkId, [newWallet]);
            },
          );
          const newW = {
            chainId,
            account,
            publicKey,
            secretKey,
            connectedSites: newAccount.connectedSites || [],
          };
          const newWallets = [...wallet.wallets, newW];
          setWallets(newWallets);
        }
      },
      () => {},
    );
  };
  const renderAccountChain = (account, key) => {
    const isSelected = account?.chainId?.toString() === wallet?.chainId?.toString();
    return (
      <ChainOption
        key={key}
        justifyContent="space-between"
        onClick={() => {
          if (!isSelected) {
            changeExistWallet(account, account?.balance);
          }
        }}
        paddingBottom={`${key === listChain.length - 1 && '20px'}`}
      >
        <DivFlex>
          <Div marginRight={isSelected ? '0' : '12px'}>{isSelected && <Image src={images.checkbox} alt="check-box" size={12} width={12} />}</Div>
          <ChainName>{`Chain ${account?.chainId}`}</ChainName>
        </DivFlex>
        <DivChild>{account?.balance}</DivChild>
      </ChainOption>
    );
  };
  return (
    <Div>
      <TitleChain>Chains</TitleChain>
      <SelectChainContent>
        {isLoading && (
          <LoadingWrapper>
            <ReactLoading type="spin" color="white" width="45px" height="45px" />
          </LoadingWrapper>
        )}
        {!isLoading && listChain.length > 0 && listChain.map((chain, key) => renderAccountChain(chain, key))}
      </SelectChainContent>
    </Div>
  );
};

export default ChainDropdown;
