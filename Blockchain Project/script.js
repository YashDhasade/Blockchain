// Sample candidate data (you can replace this with data from your contract)
const candidates = [
    { id: 1, name: "Candidate 1" },
    { id: 2, name: "Candidate 2" },
];

// DOM elements
const candidatesList = document.getElementById("candidates-list");
const voteForm = document.getElementById("vote-form");
const candidateSelect = document.getElementById("candidate-select");
const results = document.getElementById("results");

// Replace the following with your actual values
const sepoliaRPCURL = "https://eth-sepolia.g.alchemy.com/v2/";
const contractAddress = "0x331D9E0c02aeBD2f6B3172eD76e5aA606BfE1756";
const contractABI = [
    {
        "inputs": [],
        "stateMutability": "nonpayable",
        "type": "constructor"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "_candidateId",
                "type": "uint256"
            }
        ],
        "name": "vote",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "name": "candidates",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "id",
                "type": "uint256"
            },
            {
                "internalType": "string",
                "name": "name",
                "type": "string"
            },
            {
                "internalType": "uint256",
                "name": "voteCount",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "candidatesCount",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "name": "voters",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    }
];

// Function to populate the candidate select dropdown
function populateCandidates() {
    candidates.forEach(candidate => {
        const option = document.createElement("option");
        option.value = candidate.id;
        option.text = candidate.name;
        candidateSelect.appendChild(option);
    });
}

// Event listener for the vote form
voteForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const selectedCandidateId = parseInt(candidateSelect.value);

    // Check if the user has selected a valid candidate
    if (selectedCandidateId > 0) {
        // Cast the vote
        try {
            // Connect to Web3.js with your Sepolia RPC URL
            if (typeof window.ethereum !== 'undefined') {
                window.web3 = new Web3(window.ethereum);
                await window.ethereum.enable(); // Request account access
            } else if (typeof window.web3 !== 'undefined') {
                window.web3 = new Web3(window.web3.currentProvider);
            } else {
                console.error('Non-Ethereum browser detected. You should consider trying MetaMask!');
            }

            // Create a contract instance
            const votingContract = new web3.eth.Contract(contractABI, contractAddress);

            // Check if the user has already voted
            const hasVoted = await votingContract.methods.voters(window.ethereum.selectedAddress).call();
            if (hasVoted) {
                results.textContent = "You have already voted.";
            } else {
                // Cast the vote
                await votingContract.methods.vote(selectedCandidateId).send({ from: window.ethereum.selectedAddress });
                results.textContent = `You voted for ${candidates[selectedCandidateId - 1].name}`;
            }
        } catch (error) {
            console.error("Error casting the vote:", error);
            results.textContent = "Error casting the vote. Please try again.";
        }
    } else {
        results.textContent = "Please select a valid candidate.";
    }
});

// Function to update the UI with voting results
async function updateResults() {
    // Connect to Web3.js with your Sepolia RPC URL
    if (typeof window.ethereum !== 'undefined') {
        window.web3 = new Web3(window.ethereum);
        await window.ethereum.enable(); // Request account access
    } else if (typeof window.web3 !== 'undefined') {
        window.web3 = new Web3(window.web3.currentProvider);
    } else {
        console.error('Non-Ethereum browser detected. You should consider trying MetaMask!');
    }

    // Create a contract instance
    const votingContract = new web3.eth.Contract(contractABI, contractAddress);

    // Fetch and display vote counts for each candidate
    candidatesList.innerHTML = "";
    candidates.forEach(async (candidate, index) => {
        const voteCount = await votingContract.methods.candidates(index + 1).call();
        const listItem = document.createElement("li");
        listItem.textContent = `${candidate.name}: ${voteCount.voteCount} votes`;
        candidatesList.appendChild(listItem);
    });
}

// Populate the candidate select dropdown and update voting results
populateCandidates();
updateResults();