/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable react-hooks/exhaustive-deps */
import { useContext, useEffect, useState } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import cls from 'classnames';
import { fetchCoffeeStores } from '../../lib/coffee-stores';
import useSWR from 'swr';

import styles from '../../styles/coffee-stores.module.css';
import { StoreContext } from '../../store/storeContext';
import { isEmpty } from '../../utils';

export async function getStaticProps(staticProps) {
  const params = staticProps.params;
  const coffeeStores = await fetchCoffeeStores();
  const findCoffeeStoreById = coffeeStores.find(coffeeStore => {
    return coffeeStore.id == params.id;
  });

  return {
    props: {
      coffeeStore: findCoffeeStoreById ? findCoffeeStoreById : {}
    }
  };
}

export async function getStaticPaths() {
  const coffeeStores = await fetchCoffeeStores();

  const paths = coffeeStores.map((coffeeStore)=>{
    return {
      params: {
        id: coffeeStore.id.toString()
      }
    };
  });

  return {
    paths,
    fallback: true
  };
}

const CoffeeStore = (initialProps) => {
  const router = useRouter();

  const id = router.query.id;

  const [coffeeStore, setCoffeeStore] = useState(initialProps.coffeeStore);
  const [votingCount, setVotingCount] = useState(0);

  const { state: { coffeeStores } } = useContext(StoreContext);

  const handleCreateCoffeeStore = async (coffeeStore) => {
    try {
      const {id, name, voting, imgUrl, neighbourhood, address} = coffeeStore;
      const response = await fetch('/api/createCoffeeStore', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id,
          name,
          voting: 0,
          imgUrl,
          neighbourhood: neighbourhood || '',
          address: address || ''
        })
      });

      const dbCoffeeStores = await response.json();
    } catch (error) {
      console.error('Error creating coffee store', error);
    }
  };

  useEffect(() => {
    if (isEmpty(initialProps.coffeeStore)) {
      if (coffeeStores.length > 0) {
        const coffeeStoreFromContext = coffeeStores.find(coffeeStore => {
          return coffeeStore.id == id;
        });
        if (coffeeStoreFromContext){
          setCoffeeStore(coffeeStoreFromContext);
          handleCreateCoffeeStore(coffeeStoreFromContext);
        }

      }
    } else {
      handleCreateCoffeeStore(initialProps.coffeeStore);
    }
  }, [id, initialProps, initialProps.coffeeStore]);

  if (router.isFallback) {
    return <div>Loading...</div>;
  }

  const {address, neighbourhood, name, imgUrl} = coffeeStore;

  const fetcher = (url) => fetch(url).then((res) => res.json());

  const { data, error } = useSWR(`/api/getCoffeeStoreById?id=${id}`, fetcher);

  useEffect(()=>{
    if (data && data.length > 0){
      setCoffeeStore(data[0]);
      setVotingCount(data[0].voting);
    }
  },[data]);

  const handleUpvoteButton = async () => {
    try {
      const response = await fetch('/api/favoriteCoffeeStoreById', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id
        })
      });

      const dbCoffeeStore = await response.json();
      if (dbCoffeeStore && dbCoffeeStore.length > 0){
        const count = votingCount++;
        setVotingCount(count);
      }

    } catch (error) {
      console.error('Error upvoting coffee store', error);
    }

  };

  if (error){
    return <div>Something wrong retrieving coffee store page</div>;
  }

  return (
    <div className={styles.layout}>
      <Head>
        <title>{name}</title>
      </Head>
      <div className={styles.container}>
        <div className={styles.col1}>
          <div className={styles.backToHomeLink}>
            <Link href="/">&#8592; Back to Home</Link>
          </div>
          <div className={styles.nameWrapper}>
            <h1 className={styles.name}>{name}</h1>
          </div>
          <Image
            className={styles.storeImg}
            src={imgUrl || 'https://images.unsplash.com/photo-1504753793650-d4a2b783c15e?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=2000&q=80'}
            width={600}
            height={360}
            alt={name}
          />
        </div>
        <div className={cls('glass', styles.col2)}>
          <div className={styles.iconWrapper}>
            <Image src="/static/icons/map.svg" width={32} height={24} alt="some icon"/>
            <p className={styles.text}>{address}</p>
          </div>
          {neighbourhood && <div className={styles.iconWrapper}>
            <Image src="/static/icons/nearMe.svg" width={32} height={24} alt="some icon"/>
            <p className={styles.text}>{neighbourhood}</p>
          </div>}
          <div className={styles.iconWrapper}>
            <Image src="/static/icons/star.svg" width={32} height={24} alt="some icon"/>
            <p className={styles.text}>{votingCount}</p>
          </div>
          <button
            className={styles.upvoteButton}
            onClick={handleUpvoteButton}
          >Up vote!</button>
        </div>
      </div>
    </div>
  );
};

export default CoffeeStore;
