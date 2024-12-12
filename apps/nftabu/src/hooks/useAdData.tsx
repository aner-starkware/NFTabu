import { useEffect, useState } from 'react';
import { Ad } from '../types/ad';
import { useAccount, useReadContract } from '@starknet-react/core';
import { ABI, CONTRACT_ADDRESS } from '@/utils/consts';

const ad0: Ad = {
  id: 0,
  info: {
    apt: {
      id: 0,
      info: {
        address: {
          town: 'Natanya',
          street: 'Hamelacha',
          number: 32
        },
        owner: 'StarkWare',
        area: 500,
        floor: 2
      }
    },
    is_sale: false,
    price: 1000000,
    description: undefined,
    publication_date: {
      seconds: 0
    },
    entry_date: {
      seconds: 0
    },
    registered: undefined,
    picture_url: "https://thumbs.dreamstime.com/b/balmedie-aberdeenshire-scotland-united-kingdom-july-th-[…]-lodge-trump-aberdeen-next-to-donald-trump-s-141195570.jpg"
  }
};

const ad1: Ad = {
  id: 1,
  info: {
    apt: {
      id: 1,
      info: {
        address: {
          town: 'Natanya',
          street: 'Hamelacha',
          number: 32
        },
        owner: 'StarkWare',
        area: 500,
        floor: 2
      }
    },
    is_sale: true,
    price: 1000000,
    description: undefined,
    publication_date: {
      seconds: 0
    },
    entry_date: {
      seconds: 0
    },
    registered: undefined,
    picture_url: "https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg"
  }
};

const ad2: Ad = {
  id: 2,
  info: {
    apt: {
      id: 2,
      info: {
        address: {
          town: 'Natanya',
          street: 'Hamelacha',
          number: 32
        },
        owner: 'StarkWare',
        area: 500,
        floor: 2
      }
    },
    is_sale: true,
    price: 1000000,
    description: undefined,
    publication_date: {
      seconds: 0
    },
    entry_date: {
      seconds: 0
    },
    registered: undefined,
    picture_url: "https://thumbs.dreamstime.com/b/zicht-op-een-mykonos-stad-pleintje-met-oude-kerkjes-es-[…]-links-geschilderde-blauwe-vensters-en-uniek-343246490.jpg"
  }
};

/// Various hooks to interact with the ad contract.
export const useAdData = () => {
  // const { contract } = useContract({
  //   abi: ABI,
  //   address: CONTRACT_ADDRESS,
  // });
  // const n_ads = async () => {
  //   return await contract.get_next_id();
  // };
  
  const [loadingAllEvents, setLoadingAllEvents] = useState(true);
  const [isSuccessFetchingUserEvents, setSuccessFetchingUserEvents] =
    useState(false);
  const { address, isConnecting } = useAccount();

  const { data: nAds, refetch: getNextId } =
    useReadContract({
      enabled: false,
      functionName: 'get_next_id',
      abi: ABI,
      address: CONTRACT_ADDRESS,
      args: [],
    });
  const n_ads: number = nAds?.get_next_id ?? 0;
  
  const { data: adInfo, refetch: getAdInfo } =
    useReadContract({
      functionName: 'get_ad_info',
      enabled: false,
      abi: ABI,
      address: CONTRACT_ADDRESS,
      args: [
        { ad_id: BigInt },
      ],
    });
  
  const getAds = () => {
    let ads: Ad[] = [];
    for (let i = 0; i < n_ads; i++) {
      let ad: Ad = { id: i, info: adInfo?.get_add_info({ ad_id: BigInt(i) }) };
      ads.push(ad);
    }
    return [ad0, ad1, ad2];
  };
  const ads: Ad[] =  getAds();

  useEffect(() => {
    const fetchContractData = async () => {
      try {
        await Promise.all([
          getNextId(),
          getAdInfo(),
          getAds(),
        ]);

        setLoadingAllEvents(false);
        if (address) {
          setSuccessFetchingUserEvents(true);
        }
      } catch (e) {
        console.log('Caught an error while fetching ads:', e);
      }
    };

    if (!isConnecting) {
      fetchContractData();
    }
  }, [address, isConnecting]);

  const rentAds: Ad[] =
    ads
      ?.filter(
        adEvent => adEvent.info.is_sale == false,
      )
      .slice(0, 7) ?? [];
  const saleAds =
    ads?.filter(
      adEvent => adEvent.info.is_sale,
    ).slice(0, 7) ?? [];

  return {
    saleAds,
    rentAds,
    loadingAllEvents,
    isSuccessFetchingUserEvents,
    setSuccessFetchingUserEvents,
  };
};

