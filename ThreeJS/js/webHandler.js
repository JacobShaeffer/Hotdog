//TODO: figure out how to handle a player leaving a room in progress
var database;

function createRoom( public ){
    //create listener on players and appState
    console.log("creating room");
    getUsedRooms(( inuse ) => {
        console.log("retrieved active room list");
        findUsableRoom( inuse, ( roomNumber ) => {
            console.log("actually creating room now");
            database.ref( 'rooms/' + roomNumber ).set({
                public: public,
                appState: {
                    lastSelected: -1,
                    playerOne: -1,
                },
                players: {
                    me: gameState.userName,
                    you: "",
                },
            });
        
            var lastSelectedRef = database.ref( 'rooms/' + roomNumber +'/appState/lastSelected' );
            var playersRef = database.ref( 'rooms/' + roomNumber + '/players' );
        
            lastSelectedRef.on( 'value', (snapshot) => {
                var cubeNumber = snapshot.val();
                //TODO: find the cube whos number is cubeNumber
                console.log("the other player has ended their turn");
                endTurn();
            });
            playersRef.on( 'value', (snapshot) => {
                //update gamestate, and startPlaying()
                gameState.oponantUserName = snapshot.value.you;
                database.ref('rooms/' + roomNumber + '/appState').once( 'value' ).then((snapshot) =>{
                    var playerOne = snapshot.val().playerOne
                    if(playerOne == 0) gameState.showEndTurn = true;
                    startPlaying();
                });
            });
        
            onlineMultiplayerSetup( roomNumber, "" );
        });
    });
}

function createPublicRoom(){
    createRoom( false );
}

function createPrivateRoom(){
    createRoom( true );
}



function joinRoom( roomNumber ){
    currentPlayer = Math.floor(Math.random() * 2);

    onlineMultiplayerSetup( currentPlayer, roomNumber );
}

function joinSelectedRoom(){

}

/**
 * 
 */
function joinRandomRoom(){

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
    database.ref('openRooms/').once( 'value' ).then((snapshot) =>{
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
    database.ref( 'rooms/' + roomNumber +'/appState/lastSelected' ).set( number );
}

//
// Miscellaneous functions
//

function findUsableRoom( inuse, callback ){
    var roomNumber = Math.floor(Math.random()*10000);
    console.log("inuse: "+inuse[0]);
    while(inuse.indexOf(roomNumber) > -1){//FIXME: indexOf os apparently not a function
        roomNumber = Math.floor(Math.random()*10000);
    }
    callback( roomNumber );
}