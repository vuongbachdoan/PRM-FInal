import React, { useEffect, useState } from 'react';
import axios from 'axios';

type ArtTool = {
  id: string;
  artName: string;
  brand: string;
  image: string;
  price: number;
  limitedTimeDeal: number;
};

const useArtData = () => {
  const [artTools, setArtTools] = useState<ArtTool[]>([]);
  const [filteredArtTools, setFilteredArtTools] = useState<ArtTool[]>([]);
  const [selectedBrand, setSelectedBrand] = useState<string>('');

  useEffect(() => {
    axios
      .get('https://65444ee25a0b4b04436c3f2c.mockapi.io/arts')
      .then((response) => {
        setArtTools(response.data);
        setFilteredArtTools(response.data);
      })
      .catch((error) => {
        console.error('Error fetching art tools data:', error);
      });
  }, []);

  const filterByBrand = (brand: string) => {
    setSelectedBrand(brand);
    if(brand === '') {
      setFilteredArtTools(artTools)
    } else {
      setFilteredArtTools(artTools.filter((tool) => tool.brand === brand));
    }
  };

  return { artTools: filteredArtTools, filterByBrand, selectedBrand };
};

export default useArtData;
