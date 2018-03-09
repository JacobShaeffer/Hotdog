//TODO: window.onbeforeunload
var database;
var lastCube;

function createRoom(){
    //create listener on players and appState
    console.log("creating room");
    getUsedRooms(( inuse ) => {
        console.log("retrieved active room list");
        findUsableRoom( inuse, ( roomNumber ) => {
            console.log("created room " + roomNumber);
            database.ref( 'rooms/' + roomNumber ).set({
                appState: {
                    lastSelected: -1,
                    playerOne: -1,
                },
                players: {
                    me: gameState.userName,
                    you: "",
                },
            });

            //TODO: update ui
            //-place the room number on screen
            //-put "Playername VS ..." and make the elipse cycle
        
            var lastSelectedRef = database.ref( 'rooms/' + roomNumber +'/appState/lastSelected' );
            var playersRef = database.ref( 'rooms/' + roomNumber + '/players' );
        
            lastSelectedRef.on( 'value', handleCubeSelectionChanges);
            lastCube = -1;
            playersRef.on( 'value', (snapshot) => {
                //update gamestate, and startPlaying()
                gameState.oponantUserName = snapshot.val().you;
                if(gameState.oponantUserName == ""){
                    //ignore this because it is the just the initial setup being written
                    return;
                }
                console.log(gameState.oponantUserName);
                var playerOneRef = database.ref('rooms/' + roomNumber + '/appState/playerOne');
                playerOneRef.on( 'value', (snapshot) =>{
                    var playerOne = snapshot.val();
                    if(playerOne == -1){
                        //ignore this, if playerOne is -1 then I don't care about it
                        return;
                    }
                    if(playerOne == 0) gameState.showEndTurn = true;
                    console.log(playerOne);
                    playerOneRef.off(); 
                    toggleEndTurnButton( gameState.showEndTurn );
                    setUpOnlineTitle( gameState.userName, gameState.oponantUserName, 0 );
                    //TODO: update the ui to show turn and player name
                    startPlaying();
                });
            });
        
            onlineMultiplayerCreateSetup( roomNumber );
            document.getElementById( "room-display" ).innerHTML = "Room: " + padZeros( roomNumber );
            document.getElementById( "turn-display" ).innerHTML = gameState.userName + " VS ...";
        });
    });
}

function checkRoomExists( roomNumber ){
    let ref = database.ref( 'rooms/');
    let retme;
    ref.on('value', function(snapshot){
        if(snapshot.hasChild(roomNumber.toString())){
            console.log("exists");
            joinRoom(roomNumber);
        }
        else{   
            console.log("does not exist");
            alert("room does not exist");
        }
    });
}

function joinRoom( roomNumber ){

    document.getElementById( "online-overlay" ).style.display = "none";
    currentPlayer = Math.floor(Math.random() * 2);

    var lastSelectedRef = database.ref( 'rooms/' + roomNumber +'/appState/lastSelected' );
    var playersRef = database.ref( 'rooms/' + roomNumber + '/players' );
    var playerOneRef = database.ref('rooms/' + roomNumber + '/appState/playerOne');

    playerOneRef.set(currentPlayer);
    database.ref( 'rooms/' + roomNumber + '/players/you' ).set(gameState.userName);

    lastSelectedRef.on( 'value', handleCubeSelectionChanges);
    playersRef.once( 'value' ).then( (snapshot) => {
        onlineMultiplayerJoinSetup( roomNumber, currentPlayer == 1, snapshot.val().me );
        document.getElementById( "room-display" ).innerHTML = "Room: " + padZeros( roomNumber );
        setUpOnlineTitle( gameState.oponantUserName, gameState.userName, 1 );
        
        startPlaying();
    });
}

/**
 * 
 * @return {Array} list of rooms that are currently open, and public?
 */
function getOpenRooms( callback ){
    database.ref('openRooms/').once( 'value' ).then((snapshot) =>{
        var numberOpen = [];
        snapshot.forEach( (childSnap) => {
            numberOpen.push(childSnap.key);
        });
        callback(numberOpen);
    });
}

/**
 * 
 * @return {Array} list of rooms that are currently used
 */
function getUsedRooms( callback ){
    database.ref('inuseRooms/').once( 'value' ).then((snapshot) =>{
        var numbersInUse = [];
        snapshot.forEach( (childSnap) => {
            numbersInUse.push(childSnap.key);
        });
        callback(numbersInUse);
    });
}



//
// Firebase Functions
//

function setFirebaseDB(){
    database = firebase.database();
}

function setLastSelected( roomNumber, number ){
    lastCube = number;
    database.ref( 'rooms/' + roomNumber +'/appState/lastSelected' ).set( number );
}

//
// Miscellaneous functions
//

function findUsableRoom( inuse, callback ){
    var roomNumber = Math.floor(Math.random()*10000);
    console.log("inuse: "+inuse[0]);
    while(inuse.indexOf(roomNumber) > -1){
        roomNumber = Math.floor(Math.random()*10000);
    }
    callback( roomNumber );
}

function handleCubeSelectionChanges( snapshot ){
    var cubeNumber = snapshot.val();
    if(cubeNumber == -1){
        //ignore this because it is the just the initial setup being written
        return;
    }
    if(cubeNumber == lastCube){
        //Nothing has acutally changed, don't do anything
        return;
    }
    for(var i=0; i<scene.children.length; i++){
        if(scene.children[i].number == cubeNumber){
            selected = scene.children[i];
            selected.material.color.set( gameState.playerColors[gameState.currentPlayer] );
            break;
        }
    }
    lastCube = cubeNumber;
    console.log("the other player has ended their turn");
    endTurn();
}

function padZeros( number ){
    var str = number + "";
    while(str.length < 4){
        str = "0" + str;
    }
    return str;
}

function setUpOnlineTitle( firstName, secondName, who ){
    var name1 = document.getElementById( "name1-display" );
    var name2 = document.getElementById( "name2-display" );
    var turn = document.getElementById( "turn-display" );

    name1.innerHTML = firstName;
    name2.innerHTML = secondName;
    turn.innerHTML = "VS";

    switch(who){
        case 0:
            name1.style.color = gameState.showEndTurn ? "red" : "yellow";
            name2.style.color = gameState.showEndTurn ? "yellow" : "red";
            break;
        case 1:
            name1.style.color = gameState.showEndTurn ? "yellow" : "red";
            name2.style.color = gameState.showEndTurn ? "red" : "yellow";
            break;
    }
}

function clearAllRooms(){
    //TODO: delete all of the rooms on the server
}