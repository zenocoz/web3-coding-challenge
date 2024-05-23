import { createPublicClient, http } from "viem";
import { mainnet } from "viem/chains";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

// Helper to get __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Contract address for Bored Ape Yacht Club
const CONTRACT_ADDRESS = "0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d";

// ABI fragment for Transfer event
const TRANSFER_EVENT_ABI = {
	type: "event",
	name: "Transfer",
	anonymous: false,
	inputs: [
		{ indexed: true, name: "from", type: "address" },
		{ indexed: true, name: "to", type: "address" },
		{ indexed: true, name: "tokenId", type: "uint256" },
	],
};

// Initialize viem client
const client = createPublicClient({
	chain: mainnet,
	transport: http("https://rpc.ankr.com/eth"),
});

async function fetchTransferEvents(contractAddress, fromBlock, toBlock) {
	return client.getLogs({
		address: contractAddress,
		fromBlock,
		toBlock,
		event: TRANSFER_EVENT_ABI,
	});
}

//Main function
(async () => {
	try {
		const blockRange = 1000n;
		let currentBlock = 12287507n; //initial deployment block for Bored Ape Yacht Club
		let events = [];

		while (events.length < 1000) {
			const latestBlock = await client.getBlockNumber();

			if (currentBlock >= latestBlock) break;

			const endBlock =
				currentBlock + blockRange < latestBlock
					? currentBlock + blockRange
					: latestBlock;

			const newEvents = await fetchTransferEvents(
				CONTRACT_ADDRESS,
				currentBlock,
				endBlock
			);

			events = events.concat(newEvents);
			currentBlock = endBlock + 1n;

			console.log(
				`Fetched ${newEvents.length} events from block ${currentBlock} to ${endBlock}`
			);
		}

		// Trim to the first 1000 events if we got more than that
		events = events.slice(0, 1000);

		// Method to parse big ints
		const transferEvents = events.map((log) => {
			const from = `0x${log.topics[1].slice(26).toLowerCase()}`;
			const to = `0x${log.topics[2].slice(26).toLowerCase()}`;
			const tokenId = BigInt(log.topics[3]).toString();

			return { from, to, tokenId };
		});

		// Create the final state map
		const state = {};

		transferEvents.forEach(({ from, to, tokenId }) => {
			// Remove tokenId from the sender's address
			if (from !== "0x0000000000000000000000000000000000000000") {
				if (!state[from]) {
					state[from] = [];
				}
				state[from] = state[from].filter((id) => id !== tokenId);
			}

			// Add tokenId to the recipient's address
			if (!state[to]) {
				state[to] = [];
			}
			state[to].push(tokenId);
		});

		// Save to
		const outputPath = path.join(__dirname, "result.json");
		fs.writeFileSync(outputPath, JSON.stringify(state, null, 2));
		console.log("Transactions saved locally in result.json");
	} catch (error) {
		console.error("Error fetching or processing events:", error);
	}
})();
