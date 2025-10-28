import { AddressData } from './models/addressData';

export class AddressService {
  static async getAddresses(type: 'province' | 'district' | 'neighborhood' | 'street', parentId?: string) {
    const query: any = { type };
    
    if (parentId) {
      query.parentId = parentId;
    } else if (type !== 'province') {
      // İl dışında parentId olmalı
      return [];
    }

    return await AddressData.find(query).sort({ name: 1 });
  }
}
