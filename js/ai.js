//easy:   20%  best, 30% mediocre, 40% worst
//medium: 50%  best, 30% mediocre, 20% worst
//hard:   100% best, 
var difficulty;

function initializeAi( setDifficulty ){
    difficulty = setDifficulty;
}

function aiTurn(){
    var DEPTH = 2;

    var moves = [];
    for(var i=0; i<isCubeSelectable.length; i++){
        //create a copy of the current
        var child = isCubeSelectable.clone();
        if(child[i]+1 > 4 || child[i] < 0){
            //this move is illegal
            continue;
        }
        child[i]++;
        var gameState = []
        gameState.push(getCubeNumber( isCubeSelectable, i ));
        console.log(JSON.stringify(gameState));
        moves.push({number: i, value: alphabeta( child, gameState, DEPTH, -Infinity, Infinity, true)})
    }
    //var x = (moves.number % 5.0 - 2) * 2.0;
    //var y = (isCubeSelectable[i] - 2) * 2.0;
    //var z = (Math.floor(moves.number / 5.0) - 2) * 2.0;
    //endTurn();
    console.log(JSON.stringify(moves));
    moves.sort(function(a, b){
        if(a.value < b.value)
            return 1;
        else if(a.value > b.value)
            return -1;
        return 0;
    });
    selectViaNumber(moves[0].number);

}

function alphabeta( child, gameState, depth, alpha, beta, isMaximizingPlayer ){
    console.log(JSON.stringify(gameState));
    if(depth == 0) return heuristic( gameState );

    if(isMaximizingPlayer){
        var best = -Infinity;
        for(var i=0; i<child.length; i++){
            //create a copy of the current 
            if(child[i]+1 > 4 || child[i] < 0){
                //this move is illegal
                continue;
            }
            child[i]++;
            gameState.push(getCubeNumber( child, i ));
            best = Math.max(best, alphabeta( child, gameState, depth-1, alpha, beta, false));
            child[i]--;
            gameState.pop();
            alpha = Math.max(best, alpha);
            if(beta <= alpha) break;
        }
        return best;
    }
    else{
        var best = Infinity;
        for(var i=0; i<child.length; i++){
            //create a copy of the current 
            if(child[i]+1 > 4 || child[i] < 0){
                //this move is illegal
                continue;
            }
            child[i]++;
            gameState.push(getCubeNumber( child, i ));
            best = Math.min(best, alphabeta( child, gameState, depth-1, alpha, beta, true));
            child[i]--;
            gameState.pop();
            beta = Math.max(best, beta);
            if(beta <= alpha) break;
        }
        return best;
    }
}

function getCubeNumber( isCubeSelectable, index ){
    var yValue = isCubeSelectable[index];//A value ranging from 0 to 4
    var xzMapedValue = index;//a value ranging from 0 to 24 mapping the to cubes in the xz plane
    return (yValue * 25) * xzMapedValue;
}

function heuristic( gameState ){
    return Math.floor(Math.random()*2001 - 1000);
}

Array.prototype.clone = function(){
    return this.slice(0);
}