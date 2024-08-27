import React, { useState, useEffect, useCallback } from 'react';
import { GetServerSideProps, NextPage } from 'next';
import { getCharacters, Character, ApiResponse } from '../services/api';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Moon, Sun, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import debounce from 'lodash/debounce';
import { useTheme } from 'next-themes';

interface HomeProps {
  initialData: ApiResponse;
  initialStatus: string;
  initialGender: string;
  initialName: string;
  currentPage: number;
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

const Home: NextPage<HomeProps> = ({ initialData, initialStatus, initialGender, initialName, currentPage }) => {
  const [characters, setCharacters] = useState<Character[]>(initialData.results);
  const [status, setStatus] = useState<string>(initialStatus);
  const [gender, setGender] = useState<string>(initialGender);
  const [searchTerm, setSearchTerm] = useState<string>(initialName);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleFilter = useCallback(async () => {
    setIsLoading(true);
    try {
      const filteredData = await getCharacters(currentPage, { status, gender, name: searchTerm });
      setCharacters(filteredData.results);
      
      router.push({
        pathname: '/',
        query: { 
          page: currentPage,
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
  }, [status, gender, searchTerm, currentPage, router]);

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
  }, [status, gender, searchTerm, currentPage, debouncedFilter]);

  const handlePageChange = (newPage: number) => {
    router.push({
      pathname: '/',
      query: { 
        ...router.query,
        page: newPage 
      },
    });
  };

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
            <>
              <motion.div 
                key="characters"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              >
                {characters.map((character) => (
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
                ))}
              </motion.div>
              <div className="mt-8 flex justify-center items-center space-x-4">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-2 rounded-full bg-blue-500 text-white disabled:opacity-50 transition-opacity duration-300"
                >
                  <ChevronLeft size={24} />
                </button>
                <span>Page {currentPage} of {initialData.info.pages}</span>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === initialData.info.pages}
                  className="p-2 rounded-full bg-blue-500 text-white disabled:opacity-50 transition-opacity duration-300"
                >
                  <ChevronRight size={24} />
                </button>
              </div>
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  try {
    const { status, gender, name, page } = context.query;
    const currentPage = typeof page === 'string' ? parseInt(page) : 1;
    const initialStatus = typeof status === 'string' ? status : '';
    const initialGender = typeof gender === 'string' ? gender : '';
    const initialName = typeof name === 'string' ? name : '';

    const initialData = await getCharacters(currentPage, { 
      status: initialStatus, 
      gender: initialGender,
      name: initialName
    });

    return { 
      props: { 
        initialData,
        initialStatus,
        initialGender,
        initialName,
        currentPage
      } 
    };
  } catch (error) {
    console.error('Error fetching initial data:', error);
    return { 
      props: { 
        initialData: { info: { count: 0, pages: 0, next: null, prev: null }, results: [] },
        initialStatus: '',
        initialGender: '',
        initialName: '',
        currentPage: 1
      } 
    };
  }
};

export default Home;
