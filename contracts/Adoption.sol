pragma solidity ^0.5.0;

contract Adoption {
	address[16] public adopters;

	// Adopting a pet
	function adopt(uint petId) public returns (uint) {
		require(petId >= 0 && petId <= 15);

		adopters[petId] = msg.sender;

		return petId;
	}

	// Retrieving the adopters
	function getAdopters() public view returns (address[16] memory) {
		return adopters;
	}
	
	// Return Pet
	function return_pet(uint petId) public returns (address) {
		require(petId >= 0 && petId <= 15);
		
		// Address must own the pet
		require(msg.sender == adopters[petId]);
		
		adopters[petId] = 0;
		
		return adopters[petId];
	}

}
