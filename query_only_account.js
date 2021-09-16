const { ApiPromise, Keyring } = require('@polkadot/api');
const { HttpProvider } = require('@polkadot/rpc-provider');
require("dotenv").config();

const main = async () => {
    const httpProvider = new HttpProvider(process.env.DATAHUB_URL);
    const api = await ApiPromise.create({ provider: httpProvider });
    const keyring = new Keyring({type: 'sr25519'});

    // 1. Query blockchain details
    console.log(`Genesis hash: ${api.genesisHash}`);
    console.log(`Runtime version: ${api.runtimeVersion}`);
    console.log(`Library info: ${api.libraryInfo}`);

    const chain = await api.rpc.system.chain();
    const lastHeader = await api.rpc.chain.getHeader();

    console.log(`Chain name: ${chain}`);
    console.log(`Last block number: ${lastHeader.number}`);
    console.log(`Last block hash: ${lastHeader.hash}`);
    // 2. Query account details
    const { nonce, refcount, data: balance } = await api.query.system.account(process.env.ADDRESS);
    console.log(`Nonce: ${nonce}`);
    console.log(`Referendum count: ${refcount}`);
    console.log(`Free balance: ${balance.free}`);
    console.log(`Reserved balance: ${balance.reserved}`);

    // 4. Query list of transactions
    // TODO: Replace height and validatorAddr for Westend
    const height = 4626906;
    const validatorAddr = '16a4Q1iudXznPBx3CzJRaxXtYNenzGAZXdBZZkc5KrNxLXFP';
    const blockHash = await api.rpc.chain.getBlockHash(height);

    const block = await api.rpc.chain.getBlock(blockHash);
    console.log('Block details: ', block.toHuman());

    block.block.extrinsics.forEach((extrinsic, index) => {
        if (extrinsic.toHuman().isSigned) {
            console.log(`Signed transaction ${index}: `, extrinsic.toHuman());
        }
    });
}

main().catch((err) => { console.error(err) }).finally(() => process.exit())
