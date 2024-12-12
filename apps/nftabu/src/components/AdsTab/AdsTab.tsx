import { Ad } from '../../types/ad';
import { AdCard } from '../AdCard/AdCard';
import { AdCardSkeleton } from '../AdCardSkeleton/AdCardSkeleton';

export const AdsTab = ({
  ads,
  loadingAllEvents,
}: {
  ads: Ad[];
  loadingAllEvents: boolean;
  remove: (adId: string) => void;
  publish: () => void;
}) => {
  if (!ads.length) {
    return <div>No Ads to display</div>;
  }

  return (
    <>
      <div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loadingAllEvents
            ? Array(6)
                .fill(null)
                .map((_, index) => <AdCardSkeleton key={index} />)
            : ads
                .slice(0, 6)
                .map((ad, index) => (
                  <AdCard
                    id={ad.id ?? index}
                    ad={ad}
                  />
                ))}
        </div>
      </div>
    </>
  );
};
