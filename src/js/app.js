App = {
  web3Provider: null,
  accounts: [],
  contracts: {},

  init: async function() {
    // Load pets.
    $.getJSON('../pets.json', function(data) {
      var petsRow = $('#petsRow');
      var petTemplate = $('#petTemplate');

      for (i = 0; i < data.length; i ++) {
        petTemplate.find('.panel-title').text(data[i].name);
        petTemplate.find('img').attr('src', data[i].picture);
        petTemplate.find('.pet-breed').text(data[i].breed);
        petTemplate.find('.pet-age').text(data[i].age);
        petTemplate.find('.pet-location').text(data[i].location);
        petTemplate.find('.btn-adopt').attr('data-id', data[i].id);
        petTemplate.find('.btn-return').attr('data-id', data[i].id);

        petsRow.append(petTemplate.html());
      }
    });

    return await App.initWeb3();
  },

  initWeb3: async function() {

    // Modern dapp browsers...
    if (window.ethereum){
      try {
        //Request account access
        App.accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      } catch (error) {
        // User denied account access...
        console.error("User denied account access");
      }
      
      // User granted access to accounts
      console.log("Account[0]: "+App.accounts[0]);
      
      App.web3Provider = window.ethereum;
      console.log("modern dapp browser");
    }
    // Legacy dapp browsers...
    else if (window.web3) {
      App.web3Provider = window.web3.currentProvider;
      App.accounts = window.eth.accounts;
      console.log("legacy dapp browser");
    }
    // if no injected web3 instance is detected, fall back to Ganache
    else {
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
    }
    
    //web3 = new Web3(App.web3Provider);

    return App.initContract();
    
  },

  initContract: function() {

    $.getJSON('Adoption.json', function(data) {
      // Get the necessary contract artifact file and instantiate it with @truffle/contract
      var AdoptionArtifact = data;
      try { App.contracts.Adoption = TruffleContract(AdoptionArtifact); } catch (error) { console.error(error); }

      // Set the provider for our contract
      try {
        App.contracts.Adoption.setProvider(App.web3Provider);
      } catch (error){
        console.log(error);
      }
      // Use our contract to retrieve and mark the adopted pets
      return App.markAdopted();
    });

    return App.bindEvents();
  },

  bindEvents: function() {
    $(document).on('click', '.btn-adopt', App.handleAdopt);
    $(document).on('click', '.btn-return', App.handleReturn);
  },

  markAdopted: function() {

	var adoptionInstance;
    App.contracts.Adoption.deployed().then(function(instance) {
      adoptionInstance = instance;

      return adoptionInstance.getAdopters.call();
    }).then(function(adopters) {
		
		for(i=0;i<adopters.length;i++){
			if (adopters[i] != '0x0000000000000000000000000000000000000000') {
				if (adopters[i] == App.accounts[0]){
					$('.panel-pet').eq(i).find('.btn-return').text('Return').attr('disabled', false);
					$('.panel-pet').eq(i).find('.btn-adopt').text('Adopted').attr('disabled', true);
				} else {
					$('.panel-pet').eq(i).find('.btn-return').text('-').attr('disabled', true);
					$('.panel-pet').eq(i).find('.btn-adopt').text('Adopted').attr('disabled', true);
				}
			} else {
				$('.panel-pet').eq(i).find('.btn-return').text('-').attr('disabled', true);
			}
		}

		
    }).catch(function(err) {
      console.log(err.message);
    });
  },

  handleReturn: function(event) {
    event.preventDefault();
	
	var petId = parseInt($(event.target).data('id'));
	
	console.log("handleReturn petId: "+petId+" Account[0]: "+App.accounts[0]);
	console.log("petID:"+petId);
	console.log("Account[0]: "+App.accounts[0]);
	
	var adoptionInstance;
    App.contracts.Adoption.deployed().then(function(instance) {
      adoptionInstance = instance;

      return adoptionInstance.returnPet(petId, {from: App.accounts[0]});
    }).then(function(result){
		App.markAdopted();
	});
	
  },


  handleAdopt: function(event) {
    event.preventDefault();

    var petId = parseInt($(event.target).data('id'));
    console.log("handleAdopt petId: "+petId+" Account[0]: "+App.accounts[0]);
    console.log("petId:"+petId);

	var adoptionInstance;
    App.contracts.Adoption.deployed().then(function(instance) {
      adoptionInstance = instance;

      return adoptionInstance.adopt(petId, {from: App.accounts[0]});
    }).then(function(result){
		App.markAdopted();
	});
    
  }

};

$(function() {
  $(window).load(function() {
    App.init();
  });
});
