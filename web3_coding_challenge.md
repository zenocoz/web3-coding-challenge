# Web3 Coding Challenge

## Problem

We want to analyze the first 1,000 transfers of the Bored Ape Yacht Club NFT collection and want to know, which addresses held which tokenIds at the end of the 1000 transfers.

The contract is 0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d and can be found e.g. here: https://etherscan.io/address/0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d

## Goal

Build a simple script. It should comfortably fit into one file without getting messy. Save the resulting state directly into a json file from the script.

The json should look roughly like this:

```json
{
  "0xaBA7161A7fb69c88e16ED9f455CE62B791EEAAAA": [
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "10",
    "11",
    "12",
    "13",
    "14"
  ],
  "0xaBA7161A7fb69c88e16ED9f455CE62B791EEAAAB": [
    "30",
    "0"
  ],
  ...
}
```

## How to solve ?

A good way to solve this problem while also learning a bunch about EVM and Ethereum is to do it by querying events directly from the Ethereum blockchain. Viem has a comfortable way to do this which allows you to specifiy a filter for contract, block range (don't make it too large) and event "type". It's well explained in the docs.

Most contracts like e.g. the ERC721 standardized contract for NFT emit Events to allow offchain indexing of the data (instead of storing all sorts of data onchain, which is often too expensive).

Here you can see such a log: https://etherscan.io/tx/0xb43ec3831af6ed0093057cdf7289fd2766c837bb2257a38b660b4c9467975489#eventlog

On etherscan, you can see that there is a "from", "to" and "tokenId" field in the event. This is exactly what we need to solve the problem.

So lets find a way to get

- the first 1000 "Transfer" events of the contract (probably smart to find out at which block the contract was deployed)
- lets parse them so that we have "from", "to" and "tokenId" in a nice format
- lets somehow transform that data into the end format we need
- and lets safe it into a json file

## Some tips

- use Javascript (or Typescript)
- use viem getLogs to get the Events https://viem.sh/docs/actions/public/getLogs#returns
- you run into problems with the standard rpc of viem? That is expected, it is no archive node, which allows to query "historical" data. Use `https://rpc.ankr.com/eth`
- most rpcs have a limit on how many blocks you can query per time. Keep that in mind
- use chatGPT and Github Copilot

Good luck!