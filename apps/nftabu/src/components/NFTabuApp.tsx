import { useState, useMemo, useEffect } from 'react';
import { Header } from './Header/Header';
import { useAccount } from '@starknet-react/core';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { AppTabs } from '../types/ui';
import { PublishNewAdTab } from './PublishNewAdTab/PublishNewAdTab';
import { MyAdsTab } from './MyAdsTab/MyAdsTab';
import { AdsTab } from './AdsTab/AdsTab';
import { useAdData } from '../hooks/useAdData';
import { ABI, CONTRACT_ADDRESS } from '@/utils/consts';
import { addListener } from 'process';
import { useContract, useSendTransaction } from '@starknet-react/core';
import { TypedContractV2 } from 'starknet';
import { Ad } from '@/types/ad';


/// A function to create the main NFTabuApp component.
export const NFTabuApp = () => {
  const starknetWallet = useAccount();
  /// useState is a React hook that allows you to have state variables which can be accessed and updated in your component.
  /// In this case, we can access the activeTab value through the activeTab variable.
  /// We can also update the activeTab value by calling the setActiveTab function. This will cause the component to re-render.
  const [activeTab, setActiveTab] = useState<string>(AppTabs.ADS_FOR_SALE);
  const {
    saleAds,
    rentAds,
    loadingAllEvents,
    setSuccessFetchingUserEvents,
  } = useAdData();

  const onConnectWallet = async () => {
    setSuccessFetchingUserEvents(false);
  };

  const publish = async () => {
    setSuccessFetchingUserEvents(false);
  };

  const remove = async () => {
    setSuccessFetchingUserEvents(false);
  };

  // const { contract } = useContract({
  //   abi: ABI,
  //   address: CONTRACT_ADDRESS,
  // }) as { contract?: TypedContractV2<typeof ABI> };
  
  // const calls = useMemo(() => {
  //   if (!contract) return undefined;
  //   return [contract.populate('publish_ad', [ad0.info])];
  // }, [ad0.info, contract]);
  
  // const { sendAsync } = useSendTransaction({
  //   calls,
  // });
    
  return (
    <div className="min-h-screen w-screen bg-gray-100">
      <Header wallet={starknetWallet} onConnectWallet={onConnectWallet} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-4"
        >
          <TabsList>
            <TabsTrigger
              value={AppTabs.ADS_FOR_SALE}
            >
              Ads For Sale
            </TabsTrigger>
            <TabsTrigger
              value={AppTabs.ADS_FOR_RENT}
            >
              Ads For Rent
            </TabsTrigger>
            <TabsTrigger
              disabled={!starknetWallet.isConnected}
              value={AppTabs.PUBLISH_AD}
            >
              Publish Ad
              {/* <button onClick={() => sendAsync()}>Publish Ad</button> */}
            </TabsTrigger>
            <TabsTrigger
              disabled={!starknetWallet.isConnected}
              value={AppTabs.MY_ADS}
            >
              My Ads
            </TabsTrigger>
          </TabsList>
          <TabsContent value={AppTabs.ADS_FOR_SALE} className="space-y-12">
            <AdsTab
              remove={remove}
              loadingAllEvents={loadingAllEvents}
              ads={saleAds}
              publish={publish}
            />
          </TabsContent>
          <TabsContent value={AppTabs.ADS_FOR_RENT} className="space-y-12">
            <AdsTab
              remove={remove}
              loadingAllEvents={loadingAllEvents}
              ads={rentAds}
              publish={publish}
            />
          </TabsContent>
          <TabsContent value={AppTabs.PUBLISH_AD} className="space-y-12">
            <PublishNewAdTab
              setActiveTab={setActiveTab}
              // onConnectWallet={onConnectWallet}
              // isWalletConnected={starknetWallet.isConnected ?? false}
            />
          </TabsContent>
          <TabsContent
            value={AppTabs.ADS_FOR_RENT}
            className="space-y-12"
          >
          </TabsContent>
          {/* {isAdmin ? (
            <TabsContent value={AppTabs.MANAGEMENT} className="space-y-12">
              <ManagementTab />
            </TabsContent>
          ) : null} */}
        </Tabs>
      </main>
    </div>
  );
};
