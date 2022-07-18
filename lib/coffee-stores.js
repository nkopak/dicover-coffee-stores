import { createApi } from 'unsplash-js';

// on your node server
const unsplashApi = createApi({
  accessKey: process.env.NEXT_PUBLIC_UNSPLASH_MY_ACCESS_KEY
  //...other fetch options
});

const getUrlForCoffeeStores = (latLong, query, limit) => {
  return `https://api.foursquare.com/v3/places/nearby?ll=${latLong}&query=${query}&v=20220105&limit=${limit}`;
};

const getListOfCoffeeStoresPhotos = async () => {
  const photos = await unsplashApi.search.getPhotos({
    query: 'coffee shop',
    perPage: 10
  });
  const unsplashResults = photos.response.results;

  return unsplashResults.map(result => result.urls.small);
};

export const fetchCoffeeStores = async (latLong = '49.841369558844015,24.03168916583628', limit = 6) => {

  const photos = await getListOfCoffeeStoresPhotos();
  const response = await fetch(getUrlForCoffeeStores(
    latLong,
    'coffee stores',
    limit
  ),
  {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      Authorization: process.env.NEXT_PUBLIC_FOURSQUARE_API_KEY
    }
  });

  const data = await response.json();

  return data.results.map((venue, i) => {
    return {
      id: venue.fsq_id,
      address: venue.location.address || '',
      name: venue.name,
      neighbourhood: venue.location.neighborhood || venue.location.cross_street || '',
      imgUrl: photos[i]
    };
  });
};
