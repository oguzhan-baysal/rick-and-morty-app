import React, { useState, useEffect, useCallback } from 'react';
import { GetServerSideProps, NextPage } from 'next';
import { getCharacters, Character, ApiResponse } from '../services/api';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Moon, Sun, Search } from 'lucide-react';
import debounce from 'lodash/debounce';
import { useTheme } from 'next-themes';

interface HomeProps {
  initialData: ApiResponse;
}

const SkeletonCard: React.FC = () => (
  <div className="rounded-xl overflow-hidden bg-gray-200 dark:bg-gray-700 p-4">
    <div className="animate-pulse flex flex-col">
      <div className="rounded-lg bg-gray-300 dark:bg-gray-600 h-48 w-full"></div>
      <div className="flex-1 space-y-4 py-1">
        <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
        <div className="space-y-2">
          <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded"></div>
          <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-5/6"></div>
        </div>
      </div>
    </div>
  </div>
);

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const cardVariants: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100
    }
  }
};

const Home: NextPage<HomeProps> = ({ initialData }) => {
  const [allCharacters, setAllCharacters] = useState<Character[]>(initialData.results);
  const [filteredCharacters, setFilteredCharacters] = useState<Character[]>(initialData.results);
  const [status, setStatus] = useState<string>('');
  const [gender, setGender] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const applyFilters = useCallback(() => {
    let result = allCharacters;
    
    if (status) {
      result = result.filter(char => char.status.toLowerCase() === status.toLowerCase());
    }
    
    if (gender) {
      result = result.filter(char => char.gender.toLowerCase() === gender.toLowerCase());
    }
    
    if (searchTerm) {
      result = result.filter(char => char.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }
    
    setFilteredCharacters(result);
  }, [allCharacters, status, gender, searchTerm]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const handleFilter = useCallback(async () => {
    setIsLoading(true);
    try {
      const newData = await getCharacters(1, { name: searchTerm });
      setAllCharacters(newData.results);
    } catch (error) {
      console.error('Error fetching characters:', error);
      setAllCharacters([]);
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm]);

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
  }, [searchTerm, debouncedFilter]);

  if (!mounted) return null;

  return (
    <div className={`min-h-screen transition-colors duration-300 ${theme === 'dark' ? 'dark bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
      <Head>
        <title>Rick and Morty Characters</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </Head>
      <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <svg viewBox="0 0 800 200" className="mx-auto mb-8 w-full max-w-2xl">
          <defs>
            <filter id="neon">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          <text 
            x="50%" 
            y="50%" 
            dominantBaseline="middle" 
            textAnchor="middle"
            fill="#00b0c8"
            stroke="#39ff14"
            strokeWidth="2"
            filter="url(#neon)"
            style={{
              fontFamily: "'Arial', sans-serif",
              fontSize: '60px',
              fontWeight: 'bold'
            }}
          >
            Rick and Morty Characters
          </text>
        </svg>

        <div className="flex flex-col space-y-4 mb-8">
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            <select 
              className={`w-full sm:w-auto px-4 py-2 rounded-md transition-colors duration-300 ${
                theme === 'dark' 
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
              className={`w-full sm:w-auto px-4 py-2 rounded-md transition-colors duration-300 ${
                theme === 'dark' 
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
          <div className="flex items-center space-x-4">
            <div className="relative flex-grow">
              <input
                type="text"
                placeholder="Search characters..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 rounded-md transition-colors duration-300 ${
                  theme === 'dark' 
                    ? 'bg-gray-800 text-white border border-gray-700' 
                    : 'bg-white text-gray-900 border border-gray-300 shadow-sm'
                } focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500`}
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            </div>
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className={`p-2 rounded-full transition-colors duration-300 ${
                theme === 'dark' ? 'bg-yellow-400 text-gray-900' : 'bg-indigo-600 text-white'
              }`}
              aria-label={theme === 'dark' ? "Switch to light mode" : "Switch to dark mode"}
            >
              {theme === 'dark' ? <Sun size={24} /> : <Moon size={24} />}
            </button>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div 
              key="skeleton"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              {[...Array(20)].map((_, index) => (
                <SkeletonCard key={index} />
              ))}
            </motion.div>
          ) : (
            <motion.div 
              key="characters"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              {filteredCharacters.length > 0 ? (
                filteredCharacters.map((character) => (
                  <motion.div 
                    key={character.id}
                    variants={cardVariants}
                    whileHover={{ 
                      scale: 1.05, 
                      boxShadow: "0px 10px 20px rgba(0,0,0,0.2)",
                      transition: { duration: 0.3 }
                    }}
                    className={`rounded-xl overflow-hidden transition-colors duration-300 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}
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
                ))
              ) : (
                <div className="col-span-full text-center text-xl">No characters found</div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = async () => {
  try {
    const initialData = await getCharacters(1);
    return { 
      props: { 
        initialData,
      } 
    };
  } catch (error) {
    console.error('Error fetching initial data:', error);
    return { 
      props: { 
        initialData: { info: { count: 0, pages: 0, next: null, prev: null }, results: [] },
      } 
    };
  }
};

export default Home;
