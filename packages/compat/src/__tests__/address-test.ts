import { Keypair } from '@solana/web3.js';

import { fromLegacyPublicKey } from '../address';

describe('fromLegacyPublicKey', () => {
    it('should convert from a Legacy Web3 JS PublicKey to a Base58EncodedAddress', () => {
        const publicKey = Keypair.generate().publicKey;
        expect(publicKey.toBase58()).toEqual(fromLegacyPublicKey(publicKey));
    });
});
