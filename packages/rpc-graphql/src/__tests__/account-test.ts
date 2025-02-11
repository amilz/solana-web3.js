import { createSolanaRpcApi, SolanaRpcMethods } from '@solana/rpc-core';
import { createHttpTransport, createJsonRpc } from '@solana/rpc-transport';
import { Rpc } from '@solana/rpc-transport/dist/types/json-rpc-types';
import fetchMock from 'jest-fetch-mock-fork';

import { createRpcGraphQL, RpcGraphQL } from '../rpc';

describe('account', () => {
    let rpc: Rpc<SolanaRpcMethods>;
    let rpcGraphQL: RpcGraphQL;
    beforeEach(() => {
        fetchMock.resetMocks();
        fetchMock.dontMock();
        rpc = createJsonRpc<SolanaRpcMethods>({
            api: createSolanaRpcApi(),
            transport: createHttpTransport({ url: 'http://127.0.0.1:8899' }),
        });
        rpcGraphQL = createRpcGraphQL(rpc);
    });

    describe('basic queries', () => {
        // See scripts/fixtures/spl-token-token-account.json
        const variableValues = {
            address: 'AyGCwnwxQMCqaU4ixReHt8h5W4dwmxU7eM3BEQBdWVca',
            commitment: 'confirmed',
        };
        it("can query an account's lamports balance", async () => {
            expect.assertions(1);
            const source = `
            query testQuery($address: String!) {
                account(address: $address) {
                    lamports
                }
            }
        `;
            const result = await rpcGraphQL.query(source, variableValues);
            expect(result).toMatchObject({
                data: {
                    account: {
                        lamports: 10290815n,
                    },
                },
            });
        });
        it("can query an account's executable value", async () => {
            expect.assertions(1);
            const source = `
            query testQuery($address: String!, $commitment: Commitment) {
                account(address: $address, commitment: $commitment) {
                    executable
                }
            }
        `;
            const result = await rpcGraphQL.query(source, variableValues);
            expect(result).toMatchObject({
                data: {
                    account: {
                        executable: false,
                    },
                },
            });
        });
        it("can query an account's address", async () => {
            expect.assertions(1);
            const source = `
            query testQuery($address: String!, $commitment: Commitment) {
                account(address: $address, commitment: $commitment) {
                    address
                }
            }
        `;
            const result = await rpcGraphQL.query(source, variableValues);
            expect(result).toMatchObject({
                data: {
                    account: {
                        address: 'AyGCwnwxQMCqaU4ixReHt8h5W4dwmxU7eM3BEQBdWVca',
                    },
                },
            });
        });
        it('can query multiple fields', async () => {
            expect.assertions(1);
            const source = `
            query testQuery($address: String!, $commitment: Commitment) {
                account(address: $address, commitment: $commitment) {
                    executable
                    lamports
                    rentEpoch
                }
            }
        `;
            const result = await rpcGraphQL.query(source, variableValues);
            expect(result).toMatchObject({
                data: {
                    account: {
                        executable: false,
                        lamports: 10290815n,
                        rentEpoch: 0n,
                    },
                },
            });
        });
    });
    describe('nested basic queries', () => {
        // See scripts/fixtures/spl-token-token-account.json
        const variableValues = {
            address: 'AyGCwnwxQMCqaU4ixReHt8h5W4dwmxU7eM3BEQBdWVca',
            commitment: 'confirmed',
        };
        it("can perform a nested query for the account's owner", async () => {
            expect.assertions(1);
            const source = `
            query testQuery($address: String!, $commitment: Commitment) {
                account(address: $address, commitment: $commitment) {
                    owner {
                        address
                        executable
                        lamports
                        rentEpoch
                    }
                }
            }
        `;
            const result = await rpcGraphQL.query(source, variableValues);
            expect(result).toMatchObject({
                data: {
                    account: {
                        owner: {
                            address: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
                            executable: true,
                            lamports: expect.any(BigInt),
                            rentEpoch: expect.any(BigInt),
                        },
                    },
                },
            });
        });
    });
    describe('double nested basic queries', () => {
        // See scripts/fixtures/spl-token-token-account.json
        const variableValues = {
            address: 'AyGCwnwxQMCqaU4ixReHt8h5W4dwmxU7eM3BEQBdWVca',
            commitment: 'confirmed',
        };
        it("can perform a double nested query for each account's owner", async () => {
            expect.assertions(1);
            const source = `
            query testQuery($address: String!, $commitment: Commitment) {
                account(address: $address, commitment: $commitment) {
                    owner {
                        address
                        owner {
                            address
                            executable
                            lamports
                            rentEpoch
                        }
                    }
                }
            }
        `;
            const result = await rpcGraphQL.query(source, variableValues);
            expect(result).toMatchObject({
                data: {
                    account: {
                        owner: {
                            address: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
                            owner: {
                                address: 'BPFLoader2111111111111111111111111111111111',
                                executable: true,
                                lamports: expect.any(BigInt),
                                rentEpoch: expect.any(BigInt),
                            },
                        },
                    },
                },
            });
        });
    });
    describe('triple nested basic queries', () => {
        // See scripts/fixtures/spl-token-token-account.json
        const variableValues = {
            address: 'AyGCwnwxQMCqaU4ixReHt8h5W4dwmxU7eM3BEQBdWVca',
            commitment: 'confirmed',
        };
        it("can perform a triple nested query for each account's owner", async () => {
            expect.assertions(1);
            const source = `
            query testQuery($address: String!) {
                account(address: $address) {
                    owner {
                        address
                        owner {
                            address
                            owner {
                                address
                            }
                        }
                    }
                }
            }
        `;
            const result = await rpcGraphQL.query(source, variableValues);
            expect(result).toMatchObject({
                data: {
                    account: {
                        owner: {
                            address: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
                            owner: {
                                address: 'BPFLoader2111111111111111111111111111111111',
                                owner: {
                                    address: 'NativeLoader1111111111111111111111111111111',
                                },
                            },
                        },
                    },
                },
            });
        });
    });
    describe('account data queries', () => {
        it('can get account data as base58', async () => {
            expect.assertions(1);
            // See scripts/fixtures/gpa1.json
            const variableValues = {
                address: 'CcYNb7WqpjaMrNr7B1mapaNfWctZRH7LyAjWRLBGt1Fk',
                encoding: 'base58',
            };
            const source = `
                query testQuery($address: String!, $encoding: AccountEncoding) {
                    account(address: $address, encoding: $encoding) {
                        ... on AccountBase58 {
                            data
                        }
                    }
                }
            `;
            const result = await rpcGraphQL.query(source, variableValues);
            expect(result).toMatchObject({
                data: {
                    account: {
                        data: '2Uw1bpnsXxu3e',
                    },
                },
            });
        });
        it('can get account data as base64', async () => {
            expect.assertions(1);
            // See scripts/fixtures/gpa1.json
            const variableValues = {
                address: 'CcYNb7WqpjaMrNr7B1mapaNfWctZRH7LyAjWRLBGt1Fk',
                encoding: 'base64',
            };
            const source = `
                query testQuery($address: String!, $encoding: AccountEncoding) {
                    account(address: $address, encoding: $encoding) {
                        ... on AccountBase64 {
                            data
                        }
                    }
                }
            `;
            const result = await rpcGraphQL.query(source, variableValues);
            expect(result).toMatchObject({
                data: {
                    account: {
                        data: 'dGVzdCBkYXRh',
                    },
                },
            });
        });
        it('can get account data as base64+zstd', async () => {
            expect.assertions(1);
            // See scripts/fixtures/gpa1.json
            const variableValues = {
                address: 'CcYNb7WqpjaMrNr7B1mapaNfWctZRH7LyAjWRLBGt1Fk',
                encoding: 'base64Zstd',
            };
            const source = `
                query testQuery($address: String!, $encoding: AccountEncoding) {
                    account(address: $address, encoding: $encoding) {
                        ... on AccountBase64Zstd {
                            data
                        }
                    }
                }
            `;
            const result = await rpcGraphQL.query(source, variableValues);
            expect(result).toMatchObject({
                data: {
                    account: {
                        data: 'KLUv/QBYSQAAdGVzdCBkYXRh',
                    },
                },
            });
        });
    });
    describe('nested account data queries', () => {
        it('can get nested account data as base64', async () => {
            expect.assertions(1);
            // See scripts/fixtures/spl-token-token-account.json
            const variableValues = {
                address: 'AyGCwnwxQMCqaU4ixReHt8h5W4dwmxU7eM3BEQBdWVca',
                encoding: 'base64',
            };
            const source = `
                    query testQuery($address: String!, $encoding: AccountEncoding) {
                        account(address: $address, encoding: $encoding) {
                            ... on AccountBase64 {
                                data
                                owner(encoding: $encoding) {
                                    ... on AccountBase64 {
                                        data
                                    }
                                }
                            }
                        }
                    }
                `;
            const result = await rpcGraphQL.query(source, variableValues);
            expect(result).toMatchObject({
                data: {
                    account: {
                        data: '6Sg5VQll/9TWSsqvRtRd9zGOW09XyQxIfWBiXYKbg3tRbfSo3iE5g7lQFUZzej7dXNBFemsx9mHsHQF64UlEQ+BvnGLyhiMAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
                        owner: {
                            data: expect.any(String),
                        },
                    },
                },
            });
        });
    });
    describe('specific account type queries', () => {
        it('can get a mint account', async () => {
            expect.assertions(1);
            // See scripts/fixtures/spl-token-mint-account.json
            const variableValues = {
                address: 'Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr',
            };
            const source = `
                query testQuery($address: String!) {
                    account(address: $address) {
                        ... on MintAccount {
                            data {
                                parsed {
                                    info {
                                        decimals
                                        isInitialized
                                        mintAuthority {
                                            address
                                            lamports
                                        }
                                        supply
                                    }
                                    type
                                }
                                program
                                space
                            }
                        }
                    }
                }
            `;
            const result = await rpcGraphQL.query(source, variableValues);
            expect(result).toMatchObject({
                data: {
                    account: {
                        data: {
                            parsed: {
                                info: {
                                    decimals: 6,
                                    isInitialized: true,
                                    mintAuthority: {
                                        address: 'Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr',
                                        lamports: expect.any(BigInt),
                                    },
                                    supply: expect.any(String),
                                },
                                type: 'mint',
                            },
                            program: 'spl-token',
                            space: 82n,
                        },
                    },
                },
            });
        });
        it('can get a token account', async () => {
            expect.assertions(1);
            // See scripts/fixtures/spl-token-token-account.json
            const variableValues = {
                address: 'AyGCwnwxQMCqaU4ixReHt8h5W4dwmxU7eM3BEQBdWVca',
            };
            const source = `
                query testQuery($address: String!) {
                    account(address: $address) {
                        ... on TokenAccount {
                            data {
                                parsed {
                                    info {
                                        isNative
                                        mint
                                        owner {
                                            address
                                        }
                                        state
                                        tokenAmount {
                                            amount
                                            decimals
                                            uiAmount
                                            uiAmountString
                                        }
                                    }
                                    type
                                }
                                program
                                space
                            }
                        }
                    }
                }
            `;
            const result = await rpcGraphQL.query(source, variableValues);
            expect(result).toMatchObject({
                data: {
                    account: {
                        data: {
                            parsed: {
                                info: {
                                    isNative: expect.any(Boolean),
                                    mint: expect.any(String),
                                    owner: {
                                        address: '6UsGbaMgchgj4wiwKKuE1v5URHdcDfEiMSM25QpesKir',
                                    },
                                    state: expect.any(String),
                                    tokenAmount: {
                                        amount: expect.any(String),
                                        decimals: expect.any(Number),
                                        uiAmountString: expect.any(String),
                                    },
                                },
                                type: 'account',
                            },
                            program: 'spl-token',
                            space: 165n,
                        },
                    },
                },
            });
        });
        it('can get a nonce account', async () => {
            expect.assertions(1);
            // See scripts/fixtures/nonce-account.json
            const variableValues = {
                address: 'AiZExP8mK4RxDozh4r57knvqSZgkz86HrzPAMx61XMqU',
            };
            const source = `
                query testQuery($address: String!) {
                    account(address: $address) {
                        ... on NonceAccount {
                            data {
                                parsed {
                                    info {
                                        authority {
                                            address
                                        }
                                        blockhash
                                        feeCalculator {
                                            lamportsPerSignature
                                        }
                                    }
                                    type
                                }
                                program
                                space
                            }
                        }
                    }
                }
            `;
            const result = await rpcGraphQL.query(source, variableValues);
            expect(result).toMatchObject({
                data: {
                    account: {
                        data: {
                            parsed: {
                                info: {
                                    authority: {
                                        address: '3xxDCjN8s6MgNHwdRExRLa6gHmmRTWPnUdzkbKfEgNAe',
                                    },
                                    blockhash: expect.any(String),
                                    feeCalculator: {
                                        lamportsPerSignature: expect.any(String),
                                    },
                                },
                                type: 'initialized',
                            },
                            program: 'nonce',
                            space: 80n,
                        },
                    },
                },
            });
        });
        it('can get a stake account', async () => {
            expect.assertions(1);
            // See scripts/fixtures/stake-account.json
            const variableValues = {
                address: 'CSg2vQGbnwWdSyJpwK4i3qGfB6FebaV3xQTx4U1MbixN',
            };
            const source = `
                query testQuery($address: String!) {
                    account(address: $address) {
                        ... on StakeAccount {
                            data {
                                parsed {
                                    info {
                                        meta {
                                            authorized {
                                                staker {
                                                    address
                                                }
                                                withdrawer {
                                                    address
                                                }
                                            }
                                            lockup {
                                                custodian {
                                                    address
                                                }
                                                epoch
                                                unixTimestamp
                                            }
                                            rentExemptReserve
                                        }
                                        stake {
                                            creditsObserved
                                            delegation {
                                                activationEpoch
                                                deactivationEpoch
                                                stake
                                                voter {
                                                    address
                                                }
                                            }
                                        }
                                    }
                                    type
                                }
                                program
                                space
                            }
                        }
                    }
                }
            `;
            const result = await rpcGraphQL.query(source, variableValues);
            expect(result).toMatchObject({
                data: {
                    account: {
                        data: {
                            parsed: {
                                info: {
                                    meta: {
                                        authorized: {
                                            staker: {
                                                address: '3HRNKNXafhr3wE9NSXRpNVdFYt6EVygdqFwqf6WpG57V',
                                            },
                                            withdrawer: {
                                                address: '3HRNKNXafhr3wE9NSXRpNVdFYt6EVygdqFwqf6WpG57V',
                                            },
                                        },
                                        lockup: {
                                            custodian: {
                                                address: '11111111111111111111111111111111',
                                            },
                                            epoch: expect.any(BigInt),
                                            unixTimestamp: expect.any(BigInt),
                                        },
                                        rentExemptReserve: expect.any(String),
                                    },
                                    stake: {
                                        creditsObserved: expect.any(BigInt),
                                        delegation: {
                                            activationEpoch: expect.any(BigInt),
                                            deactivationEpoch: expect.any(BigInt),
                                            stake: expect.any(String),
                                            voter: {
                                                address: 'CertusDeBmqN8ZawdkxK5kFGMwBXdudvWHYwtNgNhvLu',
                                            },
                                        },
                                    },
                                },
                                type: 'delegated',
                            },
                            program: 'stake',
                            space: 200n,
                        },
                    },
                },
            });
        });
        it('can get a vote account', async () => {
            expect.assertions(1);
            // See scripts/fixtures/vote-account.json
            const variableValues = {
                address: '4QUZQ4c7bZuJ4o4L8tYAEGnePFV27SUFEVmC7BYfsXRp',
            };
            const source = `
                query testQuery($address: String!) {
                    account(address: $address) {
                        ... on VoteAccount {
                            data {
                                parsed {
                                    info {
                                        authorizedVoters {
                                            authorizedVoter {
                                                address
                                            }
                                            epoch
                                        }
                                        authorizedWithdrawer {
                                            address
                                        }
                                        commission
                                        epochCredits {
                                            credits
                                            epoch
                                            previousCredits
                                        }
                                        lastTimestamp {
                                            slot
                                            timestamp
                                        }
                                        node {
                                            address
                                        }
                                        priorVoters
                                        rootSlot
                                        votes {
                                            confirmationCount
                                            slot
                                        }
                                    }
                                    type
                                }
                                program
                                space
                            }
                        }
                    }
                }
            `;
            const result = await rpcGraphQL.query(source, variableValues);
            expect(result).toMatchObject({
                data: {
                    account: {
                        data: {
                            parsed: {
                                info: {
                                    authorizedVoters: expect.arrayContaining([
                                        {
                                            authorizedVoter: {
                                                address: 'HMU77m6WSL9Xew9YvVCgz1hLuhzamz74eD9avi4XPdr',
                                            },
                                            epoch: expect.any(BigInt),
                                        },
                                    ]),
                                    authorizedWithdrawer: {
                                        address: 'HMU77m6WSL9Xew9YvVCgz1hLuhzamz74eD9avi4XPdr',
                                    },
                                    commission: expect.any(Number),
                                    epochCredits: expect.arrayContaining([
                                        {
                                            credits: expect.any(String),
                                            epoch: expect.any(BigInt),
                                            previousCredits: expect.any(String),
                                        },
                                    ]),
                                    lastTimestamp: {
                                        slot: expect.any(BigInt),
                                        timestamp: expect.any(BigInt),
                                    },
                                    node: {
                                        address: 'HMU77m6WSL9Xew9YvVCgz1hLuhzamz74eD9avi4XPdr',
                                    },
                                    priorVoters: expect.any(Array),
                                    rootSlot: expect.any(BigInt),
                                    votes: expect.arrayContaining([
                                        {
                                            confirmationCount: expect.any(Number),
                                            slot: expect.any(BigInt),
                                        },
                                    ]),
                                },
                                type: 'vote',
                            },
                            program: 'vote',
                            space: expect.any(BigInt),
                        },
                    },
                },
            });
        });
        it('can get an address lookup table account', async () => {
            expect.assertions(1);
            // See scripts/fixtures/address-lookup-table-account.json
            const variableValues = {
                address: '2JPQuT3dHtPjrdcbUQyrrT4XYRYaWpWfmAJ54SUapg6n',
            };
            const source = `
                query testQuery($address: String!) {
                    account(address: $address) {
                        ... on LookupTableAccount {
                            data {
                                parsed {
                                    info {
                                        addresses
                                        authority {
                                            address
                                        }
                                        deactivationSlot
                                        lastExtendedSlot
                                        lastExtendedSlotStartIndex
                                    }
                                    type
                                }
                                program
                                space
                            }
                        }
                    }
                }
            `;
            const result = await rpcGraphQL.query(source, variableValues);
            expect(result).toMatchObject({
                data: {
                    account: {
                        data: {
                            parsed: {
                                info: {
                                    addresses: expect.any(Array),
                                    authority: {
                                        address: '4msgK65vdz5ADUAB3eTQGpF388NuQUAoknLxutUQJd5B',
                                    },
                                    deactivationSlot: expect.any(String),
                                    lastExtendedSlot: expect.any(String),
                                    lastExtendedSlotStartIndex: expect.any(Number),
                                },
                                type: 'lookupTable',
                            },
                            program: 'address-lookup-table',
                            space: 1304n,
                        },
                    },
                },
            });
        });
    });
    describe('when querying only an address', () => {
        describe('in the first level', () => {
            it('will not call the RPC for only an address', async () => {
                expect.assertions(1);
                const source = `
                query testQuery {
                    account(address: "AyGCwnwxQMCqaU4ixReHt8h5W4dwmxU7eM3BEQBdWVca") {
                        address
                    }
                }
            `;
                await rpcGraphQL.query(source);
                expect(fetchMock).not.toHaveBeenCalled();
            });
        });
        describe('in the second level', () => {
            it('will not call the RPC for only an address', async () => {
                expect.assertions(1);
                const source = `
                query testQuery {
                    account(address: "AyGCwnwxQMCqaU4ixReHt8h5W4dwmxU7eM3BEQBdWVca") {
                        address
                        owner {
                            address
                        }
                    }
                }
            `;
                await rpcGraphQL.query(source);
                expect(fetchMock).toHaveBeenCalledTimes(1);
            });
        });
        describe('in the third level', () => {
            it('will not call the RPC for only an address', async () => {
                expect.assertions(1);
                const source = `
                query testQuery {
                    account(address: "AyGCwnwxQMCqaU4ixReHt8h5W4dwmxU7eM3BEQBdWVca") {
                        address
                        owner {
                            address
                            owner {
                                address
                            }
                        }
                    }
                }
            `;
                await rpcGraphQL.query(source);
                expect(fetchMock).toHaveBeenCalledTimes(2);
            });
        });
    });
});
