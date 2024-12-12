import { Coins, House, Ruler } from 'lucide-react';

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../ui/card';
import { Ad } from '../../types/ad';

export const AdCard = ({
  id,
  ad,
}: {
  id: number;
  ad: Ad;
}) => {

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex justify-between items-center min-h-[30px]">
          {'Ad'} {Number(ad.id)} ({formatDate(new Date(Number(ad.info.publication_date.seconds) * 1000))})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {ad?.info?.apt?.info?.address !== undefined ? (
          <div style={{display: "flex", justifyContent: "left"}}>
            <House className="mr-2 h-4 w-4"/> 
            <p className="text-sm font-semibold">
              {Number(ad.info.apt.info.address.number)} {ad.info.apt.info.address.street}, {ad.info.apt.info.address.town}
            </p>
          </div>
        ) : 
          <div style={{display: "flex", justifyContent: "left"}}>
            <House className="mr-2 h-4 w-4"/> 
            <p className="text-sm font-semibold">
            32 Hamelacha, Natanya
            </p>
          </div>
        }
        {ad?.info?.apt?.info?.area !== undefined ? (
          <div style={{display: "flex", justifyContent: "left"}}>
            <Ruler className="mr-2 h-4 w-4"/> 
            <p className="text-sm">
              {Number(ad.info.apt.info.area)} m²
            </p>
          </div>
        ) : 
          <div style={{display: "flex", justifyContent: "left"}}>
            <Ruler className="mr-2 h-4 w-4"/> 
            <p className="text-sm">
              500 m²
            </p>
          </div>
        }
        {ad?.info?.price !== undefined ? (
          <div style={{display: "flex", justifyContent: "left"}}>
            <Coins className="mr-2 h-4 w-4"/> 
              <p className="text-sm">
                {Number(ad.info.price)} NIS
              </p>
          </div>
        ) : 
          <div style={{display: "flex", justifyContent: "left"}}>
            <Coins className="mr-2 h-4 w-4"/> <p className="text-sm"> - </p>
          </div>
        }
        {ad?.info?.apt?.info?.floor !== undefined ? (
          <p className="text-sm">
            Floor: {Number(ad.info.apt.info.floor)}
          </p>
        ) : 
          <p className="text-sm">
            Floor: 2
          </p>
        }
        {/* {ad?.info?.entry_date !== undefined ? (
          <p className="text-sm">
            Entry date: {formatDate(new Date(Number(ad.info.entry_date.seconds) * 1000))}
          </p>
        ) : 
          <p className="text-sm">
            Entry date: -
          </p>
        } */}
        {ad?.info?.description !== undefined && ad?.info?.description.length > 0 ? (
          <p className="text-sm">
            Description: {ad.info.description} 
          </p>
        ) : 
          <p className="text-sm">
            Description: -
          </p>
        }
        {ad?.info?.picture_url !== undefined && ad?.info?.picture_url.length > 0 ? (
        <div style={{display: "flex", justifyContent: "center"}}>
          <img src={ad.info.picture_url} width={200} height={200} alt="image not found"/>
        </div>
        ): [] }
      </CardContent>
      <CardFooter>
      </CardFooter>
    </Card>
  );
};
