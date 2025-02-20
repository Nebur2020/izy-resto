import axios from 'axios';
import { apiConfig } from '../../config/api.config';

export type Version = {
  id: number;
  key: string;
  value: string;
  version: number;
  isLatest: boolean;
  isStable: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export const getSettings = async (key: 'version') => {
  const response = await axios.get<{
    data: Version[];
  }>(`${apiConfig.baseUri}/settings/key/${key}/all`);
  return response.data.data;
};
