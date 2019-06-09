pragma solidity ^0.4.24;

contract subcurrency{

    struct User{
        string userName;
        uint balance;
    }

    User[] users;

    mapping(address => User) addressToUser;
    mapping(uint => address) phoneToAddress;

    event Transaction(address sender, address reciever, uint amount, uint time);
    
    function register(string _name, uint _phone) public{
        uint id = users.push(User(_name, 10000)) - 1;
        phoneToAddress[_phone] = msg.sender;
        addressToUser[msg.sender] = users[id];
    }

    function send(uint _val, uint _phone) public{
        require(addressToUser[msg.sender].balance >= _val, "You do not have enough balance");
        address _reciever = phoneToAddress[_phone];
        addressToUser[msg.sender].balance -= _val;
        addressToUser[_reciever].balance += _val;
        emit Transaction(msg.sender, _reciever, _val, now);
    }
    
    
    function getDetails(uint _phone) external view returns(string, uint){
        address addr = phoneToAddress[_phone];
        return(addressToUser[addr].userName, addressToUser[addr].balance);
    }
    
    function getAddress(uint _phone) external view returns(address){
        return(phoneToAddress[_phone]);
    }
}