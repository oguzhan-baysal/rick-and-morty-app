import React, { useState, useEffect, useCallback } from 'react';
import { GetServerSideProps, NextPage } from 'next';
import { getCharacters, Character, ApiResponse } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Moon, Sun, Search } from 'lucide-react';
import debounce from 'lodash/debounce';

interface HomeProps {
  initialData: ApiResponse;
  initialStatus: string;
  initialGender: string;
  initialName: string;
}

const Home: NextPage<HomeProps> = ({ initialData, initialStatus, initialGender, initialName }) => {
  const [characters, setCharacters] = useState<Character[]>(initialData.results);
  const [status, setStatus] = useState<string>(initialStatus);
  const [gender, setGender] = useState<string>(initialGender);
  const [searchTerm, setSearchTerm] = useState<string>(initialName);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const router = useRouter();

  const handleFilter = useCallback(async () => {
    setIsLoading(true);
    try {
      const filteredData = await getCharacters(1, { status, gender, name: searchTerm });
      setCharacters(filteredData.results);
      
      router.push({
        pathname: '/',
        query: { 
          ...(status && { status }), 
          ...(gender && { gender }),
          ...(searchTerm && { name: searchTerm })
        },
      }, undefined, { shallow: true });

    } catch (error) {
      console.error('Error filtering characters:', error);
    } finally {
      setIsLoading(false);
    }
  }, [status, gender, searchTerm, router]);

  const debouncedFilter = useCallback(
    debounce(() => {
      handleFilter();
    }, 300),
    [handleFilter]
  );

  useEffect(() => {
    debouncedFilter();
    return () => {
      debouncedFilter.cancel();
    };
  }, [status, gender, searchTerm, debouncedFilter]);

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
      <Head>
        <title>Rick and Morty Characters</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </Head>
      <div className="container mx-auto py-8 px-4">
        <motion.h1 
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-4xl md:text-5xl font-extrabold text-center mb-8"
        >
          Rick and Morty Characters
        </motion.h1>
        
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 space-y-4 md:space-y-0 md:space-x-4">
          <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4 w-full md:w-auto">
            <select 
              className={`w-full sm:w-auto px-4 py-2 rounded-md ${
                darkMode 
                  ? 'bg-gray-800 text-white border border-gray-700' 
                  : 'bg-white text-gray-900 border border-gray-300 shadow-sm'
              } focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500`}
              value={status} 
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="">All Status</option>
              <option value="alive">Alive</option>
              <option value="dead">Dead</option>
              <option value="unknown">Unknown</option>
            </select>
            <select 
              className={`w-full sm:w-auto px-4 py-2 rounded-md ${
                darkMode 
                  ? 'bg-gray-800 text-white border border-gray-700' 
                  : 'bg-white text-gray-900 border border-gray-300 shadow-sm'
              } focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500`}
              value={gender} 
              onChange={(e) => setGender(e.target.value)}
            >
              <option value="">All Genders</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="genderless">Genderless</option>
              <option value="unknown">Unknown</option>
            </select>
          </div>
          <div className="flex items-center space-x-4 w-full md:w-auto">
            <div className="relative flex-grow">
              <input
                type="text"
                placeholder="Search characters..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 rounded-md ${
                  darkMode 
                    ? 'bg-gray-800 text-white border border-gray-700' 
                    : 'bg-white text-gray-900 border border-gray-300 shadow-sm'
                } focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500`}
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            </div>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`p-2 rounded-full ${darkMode ? 'bg-indigo-400 text-gray-900' : 'bg-indigo-600 text-white'}`}
              aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
            >
              {darkMode ? <Sun size={24} /> : <Moon size={24} />}
            </button>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loader"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex justify-center items-center h-64"
            >
              <div className="loader"></div>
            </motion.div>
          ) : (
            <motion.div 
              key="characters"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              {characters.map((character) => (
                <motion.div 
                  key={character.id} 
                  className={`rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 ease-in-out ${darkMode ? 'bg-gray-800' : 'bg-white'}`}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <img src={character.image} alt={character.name} className="w-full h-48 sm:h-56 object-cover" />
                  <div className="p-4 sm:p-6">
                    <h2 className="text-xl sm:text-2xl font-bold mb-2 truncate">{character.name}</h2>
                    <p className="text-sm sm:text-base mb-1">
                      <span className="font-semibold">Status:</span> 
                      <span className={`ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        character.status === 'Alive' ? 'bg-green-100 text-green-800' : 
                        character.status === 'Dead' ? 'bg-red-100 text-red-800' : 
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {character.status}
                      </span>
                    </p>
                    <p className="text-sm sm:text-base mb-1"><span className="font-semibold">Species:</span> {character.species}</p>
                    <p className="text-sm sm:text-base"><span className="font-semibold">Gender:</span> {character.gender}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  try {
    const { status, gender, name } = context.query;
    const initialStatus = typeof status === 'string' ? status : '';
    const initialGender = typeof gender === 'string' ? gender : '';
    const initialName = typeof name === 'string' ? name : '';

    const initialData = await getCharacters(1, { 
      status: initialStatus, 
      gender: initialGender,
      name: initialName
    });

    return { 
      props: { 
        initialData,
        initialStatus,
        initialGender,
        initialName
      } 
    };
  } catch (error) {
    console.error('Error fetching initial data:', error);
    return { 
      props: { 
        initialData: { info: { count: 0, pages: 0, next: null, prev: null }, results: [] },
        initialStatus: '',
        initialGender: '',
        initialName: ''
      } 
    };
  }
};

export default Home;
