import axios from 'axios';

const API_BASE_URL = 'https://rickandmortyapi.com/api';

export interface Character {
  id: number;
  name: string;
  status: string;
  species: string;
  type: string;
  gender: string;
  origin: {
    name: string;
    url: string;
  };
  location: {
    name: string;
    url: string;
  };
  image: string;
  episode: string[];
  url: string;
  created: string;
}

export interface ApiResponse {
  info: {
    count: number;
    pages: number;
    next: string | null;
    prev: string | null;
  };
  results: Character[];
}

export const getCharacters = async (
  page: number = 1, 
  filters: { status?: string; gender?: string; name?: string } = {}
): Promise<ApiResponse> => {
  try {
    const params = new URLSearchParams({ page: page.toString() });
    if (filters.status) params.append('status', filters.status);
    if (filters.gender) params.append('gender', filters.gender);
    if (filters.name) params.append('name', filters.name);

    const response = await axios.get<ApiResponse>(`${API_BASE_URL}/character`, { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching characters:', error);
    throw error;
  }
};

export const getCharacterById = async (id: number): Promise<Character> => {
  try {
    const response = await axios.get<Character>(`${API_BASE_URL}/character/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching character with id ${id}:`, error);
    throw error;
  }
};