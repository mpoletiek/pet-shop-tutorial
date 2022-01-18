pragma solidity ^0.5.0;

import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
import "../contracts/Adoption.sol";

contract TestAdoption {
	// The address of the adoption contract to be tested
	Adoption adoption = Adoption(DeployedAddresses.Adoption());

	// The id of the pet that will be used for testing
	uint expectedPetId = 8;

	// The expected owner of the adopted pet in this contract
	address expectedAdopter = address(this);

	// Testing the adopt() function
	function testUserCanAdoptPet() public {
		uint returnedId = adoption.adopt(expectedPetId);
		
		Assert.equal(returnedId, expectedPetId, "Adoption of the expected pet should match what is returned.");
	}

	// Testing retrieval of a single pet's owner
	function testGetAdopterAddressByPetId() public {
		address adopter = adoption.adopters(expectedPetId);

		Assert.equal(adopter, expectedAdopter, "Owner of the expected pet should be this contract");
	}
	
	// Testing retrieval of all pet owners
	function testGetAdopterAddressByPetIdInArray() public {
		// Store adopters in memory rather than contract's storage
		address[16] memory adopters = adoption.getAdopters();

		Assert.equal(adopters[expectedPetId], expectedAdopter, "Owner of the expected pet should be this contract");
	}
	
	// Testing returning a pet
	function testReturnPet() public {
		// Delete adopter's entry in in the array
		uint petId = adoption.returnPet(expectedPetId);
		
		Assert.equal(petId, expectedPetId, "expected Pet Id is 8");
	}

	

}
